const wooProduct = {
  id: 42,
  name: "Body variable",
  slug: "body-variable",
  price: "15000",
  regular_price: "15000",
  stock_status: "instock",
  stock_quantity: 3,
  type: "variable",
  images: [],
  categories: [{ id: 7, name: "Bodies", slug: "bodies" }],
  attributes: [
    { name: "Talle", options: ["0-3 meses", "3-6 meses"] },
    { name: "Color", options: ["Natural"] },
  ],
};

const underpricedWooProduct = {
  ...wooProduct,
  price: "1",
  regular_price: "1",
};

function wooResponse(body: unknown, headers: Record<string, string> = {}) {
  return {
    ok: true,
    json: jest.fn().mockResolvedValue(body),
    text: jest.fn().mockResolvedValue(""),
    headers: new Headers(headers),
  } as unknown as Response;
}

describe("WooCommerce request fan-out", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      WOOCOMMERCE_URL: "https://shop.example.com",
      WOOCOMMERCE_CONSUMER_KEY: "ck_test",
      WOOCOMMERCE_CONSUMER_SECRET: "cs_test",
    };
    delete process.env.WOOCOMMERCE_PRODUCTS_REVALIDATE_SECONDS;
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  it("loads real variable prices in one batch without expanding the catalog request", async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(wooResponse([underpricedWooProduct], {
        "x-wp-total": "25",
        "x-wp-totalpages": "3",
      }))
      .mockResolvedValueOnce(wooResponse([{
        id: 42,
        prices: {
          currency_minor_unit: 2,
          price: "1250000",
          regular_price: "1500000",
          sale_price: "1250000",
          price_range: { min_amount: "1250000", max_amount: "1500000" },
        },
      }]));
    global.fetch = fetchMock;

    const { getStoreProductCollection } = await import("@/lib/woocommerce");
    const collection = await getStoreProductCollection({
      page: 2,
      perPage: 12,
      inStockFirst: true,
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const requestUrl = String(fetchMock.mock.calls[0][0]);
    expect(requestUrl).toContain("/wp-json/wc/v3/products?");
    expect(requestUrl).toContain("per_page=12");
    expect(requestUrl).toContain("page=2");
    expect(requestUrl).not.toContain("variations");
    const priceRequestUrl = String(fetchMock.mock.calls[1][0]);
    expect(priceRequestUrl).toContain("/wp-json/wc/store/v1/products?");
    expect(priceRequestUrl).toContain("include=42");
    expect(priceRequestUrl).toContain("return_price_range=true");
    expect(priceRequestUrl).not.toContain("variations");

    expect(collection).toMatchObject({
      total: 25,
      totalPages: 3,
      page: 2,
      perPage: 12,
    });
    expect(collection.products[0]).toMatchObject({
      id: "42",
      sizes: ["0\u20133 meses", "3\u20136 meses"],
      colors: ["Natural"],
      price: 12500,
      prices: { base: 12500, list: 15000, discount: 12500 },
    });
  });

  it("loads variations only for the product detail and caches both requests", async () => {
    const variation = {
      id: 4201,
      price: "15000",
      regular_price: "15000",
      stock_status: "instock",
      stock_quantity: 2,
      attributes: [
        { name: "Talle", option: "0-3 meses" },
        { name: "Color", option: "Natural" },
      ],
    };
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(wooResponse([wooProduct]))
      .mockResolvedValueOnce(wooResponse([variation]));
    global.fetch = fetchMock;

    const { getStoreProductBySlug } = await import("@/lib/woocommerce");
    const product = await getStoreProductBySlug("body-variable");

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(String(fetchMock.mock.calls[1][0])).toContain("/products/42/variations");
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ next: { revalidate: 900 } });
    expect(fetchMock.mock.calls[1][1]).toMatchObject({ next: { revalidate: 900 } });
    expect(product?.variants).toHaveLength(1);
    expect(product?.variants?.[0]).toMatchObject({ id: "4201", stock: 2 });
  });

  it("limits simultaneous WooCommerce reads to two per instance", async () => {
    let activeRequests = 0;
    process.env.WOOCOMMERCE_MAX_CONCURRENT_READS = "4";
    let peakRequests = 0;
    const fetchMock = jest.fn().mockImplementation(async () => {
      activeRequests += 1;
      peakRequests = Math.max(peakRequests, activeRequests);
      await new Promise((resolve) => setTimeout(resolve, 5));
      activeRequests -= 1;
      return wooResponse([wooProduct], {
        "x-wp-total": "96",
        "x-wp-totalpages": "8",
      });
    });
    global.fetch = fetchMock;

    const { getStoreProductCollection } = await import("@/lib/woocommerce");
    await Promise.all(
      Array.from({ length: 8 }, (_, index) =>
        getStoreProductCollection({ page: index + 1, perPage: 12 }),
      ),
    );

    expect(fetchMock).toHaveBeenCalledTimes(8);
    expect(peakRequests).toBe(2);
  });
  it("builds the whole home from one product collection", async () => {
    const homeProduct = {
      ...underpricedWooProduct,
      featured: true,
      date_created: "2026-08-07T10:00:00",
      tags: [{ name: "Home", slug: "home-fimy" }],
    };
    const fetchMock = jest.fn().mockImplementation((input: URL | RequestInfo) => {
      const url = String(input);
      if (url.includes("/wc/v3/products/categories")) {
        return Promise.resolve(wooResponse([{ id: 7, name: "Bodies", slug: "bodies" }]));
      }
      if (url.includes("/wc/store/v1/products?")) {
        return Promise.resolve(wooResponse([{
          id: 42,
          prices: {
            currency_minor_unit: 2,
            price: "1250000",
            regular_price: "1500000",
            sale_price: "1250000",
            price_range: { min_amount: "1250000", max_amount: "1500000" },
          },
        }]));
      }
      if (url.includes("/wc/v3/products?")) {
        return Promise.resolve(wooResponse([homeProduct], {
          "x-wp-total": "1",
          "x-wp-totalpages": "1",
        }));
      }
      throw new Error(`Unexpected request: ${url}`);
    });
    global.fetch = fetchMock;

    const { getHomeStorefrontData } = await import("@/lib/woocommerce");
    const storefront = await getHomeStorefrontData(15);

    const collectionRequests = fetchMock.mock.calls
      .map(([input]) => String(input))
      .filter((url) => url.includes("/wc/v3/products?"));
    expect(collectionRequests).toHaveLength(1);
    expect(collectionRequests[0]).toContain("per_page=100");
    expect(collectionRequests[0]).toContain("orderby=date");
    expect(collectionRequests[0]).not.toContain("featured=true");
    expect(storefront.featured[0]).toMatchObject({ id: "42", price: 12500 });
    expect(storefront.newestProducts[0]).toMatchObject({ id: "42", price: 12500 });
    expect(storefront.filterOptions.categories[0]).toMatchObject({ id: "7", slug: "bodies" });
  });

  it("builds catalog filters without downloading the product catalog", async () => {
    const fetchMock = jest.fn().mockImplementation((input: URL | RequestInfo) => {
      const url = String(input);
      if (url.includes("/products/categories")) {
        return Promise.resolve(wooResponse([{ id: 7, name: "Bodies", slug: "bodies" }]));
      }
      if (url.includes("/products/attributes/1/terms")) {
        return Promise.resolve(wooResponse([{ id: 11, name: "0-3 meses", slug: "0-3-meses" }]));
      }
      if (url.includes("/products/attributes/2/terms")) {
        return Promise.resolve(wooResponse([{ id: 12, name: "Natural", slug: "natural" }]));
      }
      if (url.includes("/products/attributes?")) {
        return Promise.resolve(wooResponse([
          { id: 1, name: "Talle", slug: "pa_talle" },
          { id: 2, name: "Color", slug: "pa_color" },
        ]));
      }
      if (url.includes("/products/collection-data?")) {
        return Promise.resolve(wooResponse({
          price_range: {
            currency_minor_unit: 2,
            min_price: "1000000",
            max_price: "2000000",
          },
        }));
      }
      throw new Error(`Unexpected request: ${url}`);
    });
    global.fetch = fetchMock;

    const { getStoreProductFilters } = await import("@/lib/woocommerce");
    const filters = await getStoreProductFilters();

    const productCatalogRequests = fetchMock.mock.calls
      .map(([input]) => String(input))
      .filter((url) => /\/wc\/v3\/products\?/.test(url));
    expect(productCatalogRequests).toHaveLength(0);
    expect(filters).toMatchObject({
      sizes: ["0\u20133 meses"],
      colors: ["Natural"],
      price: { min: 10000, max: 20000 },
    });
  });

});
