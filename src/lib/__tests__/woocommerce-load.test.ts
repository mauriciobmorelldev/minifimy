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

  it("does not load variations for catalog cards or expand stock sorting to 100 products", async () => {
    const fetchMock = jest.fn().mockResolvedValue(
      wooResponse([wooProduct], {
        "x-wp-total": "25",
        "x-wp-totalpages": "3",
      }),
    );
    global.fetch = fetchMock;

    const { getStoreProductCollection } = await import("@/lib/woocommerce");
    const collection = await getStoreProductCollection({
      page: 2,
      perPage: 12,
      inStockFirst: true,
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const requestUrl = String(fetchMock.mock.calls[0][0]);
    expect(requestUrl).toContain("/wp-json/wc/v3/products?");
    expect(requestUrl).toContain("per_page=12");
    expect(requestUrl).toContain("page=2");
    expect(requestUrl).not.toContain("variations");
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

  it("limits simultaneous WooCommerce reads to four", async () => {
    let activeRequests = 0;
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
    expect(peakRequests).toBe(4);
  });
});
