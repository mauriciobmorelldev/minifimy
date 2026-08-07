const originalEnvironment = process.env;

describe("WooCommerce catalog load", () => {
  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnvironment,
      WOOCOMMERCE_URL: "https://store.example.com",
      WOOCOMMERCE_CONSUMER_KEY: "consumer-key",
      WOOCOMMERCE_CONSUMER_SECRET: "consumer-secret",
    };
  });

  afterEach(() => {
    process.env = originalEnvironment;
    jest.restoreAllMocks();
  });

  it("hydrates catalog prices in one shared request without loading variations", async () => {
    const products = Array.from({ length: 6 }, (_, index) => {
      const id = index + 1;
      return {
        id,
        name: `Product ${id}`,
        slug: `product-${id}`,
        price: "1",
        regular_price: "1",
        stock_status: "instock",
        images: [],
        categories: [],
        attributes: [],
        type: "variable",
      };
    });
    let variationRequestCount = 0;
    let priceSummaryRequestCount = 0;

    global.fetch = jest.fn(async (input: RequestInfo | URL) => {
      const url = new URL(String(input));

      if (/\/products\/\d+\/variations$/.test(url.pathname)) {
        variationRequestCount += 1;
        throw new Error("Catalog listings must not request variations");
      }

      if (url.pathname.endsWith("/wc/store/v1/products")) {
        priceSummaryRequestCount += 1;
        await new Promise((resolve) => setTimeout(resolve, 10));
        return {
          ok: true,
          status: 200,
          headers: new Headers(),
          json: async () => products.map((product) => ({
            id: product.id,
            on_sale: true,
            is_in_stock: true,
            prices: {
              price: String(80_000 + product.id * 100),
              regular_price: String(100_000 + product.id * 100),
              sale_price: String(80_000 + product.id * 100),
              currency_minor_unit: 2,
            },
          })),
        } as Response;
      }

      return {
        ok: true,
        status: 200,
        headers: new Headers({ "x-wp-total": "6", "x-wp-totalpages": "1" }),
        json: async () => products,
      } as Response;
    }) as typeof fetch;

    const { getDiscountedStoreProducts, getStoreProductCollection } = await import("@/lib/woocommerce");
    const [firstCollection, secondCollection] = await Promise.all([
      getStoreProductCollection({ perPage: 6, search: "first" }),
      getStoreProductCollection({ perPage: 6, search: "second" }),
    ]);

    expect(variationRequestCount).toBe(0);
    expect(priceSummaryRequestCount).toBe(1);
    expect(firstCollection.products).toHaveLength(6);
    expect(secondCollection.products).toHaveLength(6);
    expect(firstCollection.products[0]).toMatchObject({
      price: 801,
      prices: { base: 801, list: 1001, sale: 801 },
      stock: 1,
      stockStatus: "instock",
    });
    expect(firstCollection.products[0].variants).toBeUndefined();

    const discountedProducts = await getDiscountedStoreProducts(4);
    const requestedUrls = (global.fetch as jest.Mock).mock.calls.map(([input]) => new URL(String(input)));
    expect(discountedProducts).toHaveLength(4);
    expect(requestedUrls.some((url) => url.pathname.endsWith("/wc/v3/products") && url.searchParams.get("on_sale") === "true"))
      .toBe(true);
  });

  it("builds filters from metadata and an aggregate price range", async () => {
    global.fetch = jest.fn(async (input: RequestInfo | URL) => {
      const url = new URL(String(input));

      if (url.pathname.endsWith("/wc/store/v1/products/collection-data")) {
        return {
          ok: true,
          status: 200,
          headers: new Headers(),
          json: async () => ({
            price_range: { min_price: "120000", max_price: "450000", currency_minor_unit: 2 },
          }),
        } as Response;
      }

      if (url.pathname.endsWith("/products/categories")) {
        return { ok: true, status: 200, headers: new Headers(), json: async () => [] } as Response;
      }

      if (url.pathname.endsWith("/products/attributes")) {
        return {
          ok: true,
          status: 200,
          headers: new Headers(),
          json: async () => [
            { id: 1, name: "Talle", slug: "pa_talle" },
            { id: 2, name: "Color", slug: "pa_color" },
          ],
        } as Response;
      }

      if (url.pathname.endsWith("/products/attributes/1/terms")) {
        return { ok: true, status: 200, headers: new Headers(), json: async () => [{ id: 1, name: "3-6 meses", slug: "3-6-meses" }] } as Response;
      }

      if (url.pathname.endsWith("/products/attributes/2/terms")) {
        return { ok: true, status: 200, headers: new Headers(), json: async () => [{ id: 2, name: "Azul", slug: "azul" }] } as Response;
      }

      throw new Error(`Unexpected request: ${url}`);
    }) as typeof fetch;

    const { getStoreProductFilters } = await import("@/lib/woocommerce");
    const filters = await getStoreProductFilters();
    const requestedUrls = (global.fetch as jest.Mock).mock.calls.map(([input]) => new URL(String(input)));

    expect(filters).toMatchObject({
      sizes: ["3–6 meses"],
      colors: ["Azul"],
      price: { min: 1200, max: 4500 },
    });
    expect(requestedUrls.some((url) => url.pathname.endsWith("/wc/v3/products"))).toBe(false);
  });
});
