const originalEnvironment = process.env;

describe("WooCommerce catalog variation requests", () => {
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

  it("limits concurrent variation requests and deduplicates overlapping catalog renders", async () => {
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
    let activeVariationRequests = 0;
    let peakVariationRequests = 0;
    let variationRequestCount = 0;

    global.fetch = jest.fn(async (input: RequestInfo | URL) => {
      const url = new URL(String(input));
      const variationMatch = url.pathname.match(/products\/(\d+)\/variations$/);

      if (variationMatch) {
        const productId = Number(variationMatch[1]);
        variationRequestCount += 1;
        activeVariationRequests += 1;
        peakVariationRequests = Math.max(peakVariationRequests, activeVariationRequests);
        await new Promise((resolve) => setTimeout(resolve, 10));
        activeVariationRequests -= 1;

        return {
          ok: true,
          status: 200,
          headers: new Headers(),
          json: async () => [{
            id: productId * 10,
            price: String(1_000 + productId),
            regular_price: String(1_000 + productId),
            stock_quantity: 3,
            stock_status: "instock",
            attributes: [{ name: "Talle", option: "3-6 meses" }],
          }],
        } as Response;
      }

      return {
        ok: true,
        status: 200,
        headers: new Headers({ "x-wp-total": "6", "x-wp-totalpages": "1" }),
        json: async () => products,
      } as Response;
    }) as typeof fetch;

    const { getStoreProductCollection } = await import("@/lib/woocommerce");
    const [firstCollection, secondCollection] = await Promise.all([
      getStoreProductCollection({ perPage: 6, search: "first" }),
      getStoreProductCollection({ perPage: 6, search: "second" }),
    ]);

    expect(variationRequestCount).toBe(6);
    expect(peakVariationRequests).toBeLessThanOrEqual(2);
    expect(firstCollection.products).toHaveLength(6);
    expect(secondCollection.products).toHaveLength(6);
    expect(firstCollection.products[0]).toMatchObject({
      price: 1_001,
      sizes: ["3–6 meses"],
      stock: 3,
    });
    expect(firstCollection.products[0].variants).toHaveLength(1);
  });
});
