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
            is_in_stock: true,
            prices: {
              price: String(80_000 + product.id * 100),
              regular_price: String(100_000 + product.id * 100),
              sale_price: String(80_000 + product.id * 100),
              currency_minor_unit: 2,
            },
            attributes: [
              { name: "Color", taxonomy: "pa_color", terms: [{ name: "Azul" }, { name: "Rosa bebé" }] },
              { name: "Diseño", taxonomy: "pa_diseno", terms: [{ name: "Conejitos" }] },
            ],
            extensions: {
              minifimy: {
                list_price: String(1001 + product.id),
                discount_price: String(701 + product.id),
              },
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

    const { getStoreProductCollection } = await import("@/lib/woocommerce");
    const [firstCollection, secondCollection] = await Promise.all([
      getStoreProductCollection({ perPage: 6, search: "first" }),
      getStoreProductCollection({ perPage: 6, search: "second" }),
    ]);
    const priceSummaryUrl = (global.fetch as jest.Mock).mock.calls
      .map(([input]) => new URL(String(input)))
      .find((url) => url.pathname.endsWith("/wc/store/v1/products"));

    expect(variationRequestCount).toBe(0);
    expect(priceSummaryRequestCount).toBe(1);
    expect(priceSummaryUrl?.searchParams.get("minifimy_price_contract")).toBe("2");
    expect(firstCollection.products).toHaveLength(6);
    expect(secondCollection.products).toHaveLength(6);
    expect(firstCollection.products[0]).toMatchObject({
      price: 702,
      prices: { base: 702, list: 1002, discount: 702 },
      colors: ["Azul", "Rosa bebé"],
      models: ["Conejitos"],
      stock: 1,
      stockStatus: "instock",
    });
    expect(firstCollection.products[0].variants).toBeUndefined();

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
  it("builds scoped filters only from products in the active category", async () => {
    const product = {
      id: 41,
      name: "Gorrito",
      slug: "gorrito",
      price: "1800",
      regular_price: "2200",
      stock_status: "instock",
      images: [],
      categories: [{ id: 8, name: "Accesorios", slug: "accesorios" }],
      attributes: [
        { name: "Talle", options: ["Talle único"] },
        { name: "Color", options: ["Verde"] },
      ],
    };
    global.fetch = jest.fn(async (input: RequestInfo | URL) => {
      const url = new URL(String(input));
      if (url.pathname.endsWith("/products/categories")) {
        return { ok: true, status: 200, headers: new Headers(), json: async () => [{ id: 8, name: "Accesorios", slug: "accesorios" }] } as Response;
      }
      if (url.pathname.endsWith("/wc/store/v1/products")) {
        return {
          ok: true,
          status: 200,
          headers: new Headers(),
          json: async () => [{
            id: 41,
            is_in_stock: true,
            prices: { price: "180000", regular_price: "220000", currency_minor_unit: 2 },
            extensions: { minifimy: { list_price: "2200", discount_price: "1800" } },
            attributes: [
              { name: "Talle", taxonomy: "pa_talle", terms: [{ name: "Talle único" }] },
              { name: "Color", taxonomy: "pa_color", terms: [{ name: "Verde" }] },
            ],
          }],
        } as Response;
      }
      if (url.pathname.endsWith("/wc/v3/products")) {
        return {
          ok: true,
          status: 200,
          headers: new Headers({ "x-wp-total": "1", "x-wp-totalpages": "1" }),
          json: async () => [product],
        } as Response;
      }
      throw new Error(`Unexpected request: ${url}`);
    }) as typeof fetch;

    const { getStoreProductFilters } = await import("@/lib/woocommerce");
    const filters = await getStoreProductFilters({ category: "8" });
    const urls = (global.fetch as jest.Mock).mock.calls.map(([input]) => new URL(String(input)));
    const listing = urls.find((url) => url.pathname.endsWith("/wc/v3/products"));

    expect(listing?.searchParams.get("category")).toBe("8");
    expect(filters).toMatchObject({
      sizes: ["Talle único"],
      colors: ["Verde"],
      price: { min: 1800, max: 2200 },
    });
    expect(urls.some((url) => url.pathname.endsWith("/products/attributes"))).toBe(false);
    expect(urls.some((url) => url.pathname.endsWith("/collection-data"))).toBe(false);
  });

  it("filters age before server pagination using all cached attribute pages without variations", async () => {
    const response = (data: unknown, totalPages = 1) => ({
      ok: true, status: 200,
      headers: new Headers({ "x-wp-total": "1", "x-wp-totalpages": String(totalPages) }),
      json: async () => data,
    }) as Response;
    global.fetch = jest.fn(async (input: RequestInfo | URL) => {
      const url = new URL(String(input));
      if (url.searchParams.get("_fields") === "id,attributes,meta_data") {
        return response(url.searchParams.get("page") === "1" ? [
          { id: 1, attributes: [{ name: "Talle", options: ["18–24 meses"] }] },
          { id: 2, attributes: [{ name: "Talle", options: ["3 años"] }] },
        ] : [{ id: 3, attributes: [{ name: "Talle", options: ["4 años"] }] }], 2);
      }
      if (url.pathname.endsWith("/wc/store/v1/products")) return response([]);
      return response([{ id: 3, name: "Pantalón", slug: "pantalon", price: "1200", images: [], attributes: [{ name: "Talle", options: ["4 años"] }] }]);
    }) as typeof fetch;
    const { getStoreProductCollection } = await import("@/lib/woocommerce");
    const collection = await getStoreProductCollection({ ageGroup: "ninos", category: "8", page: 2, perPage: 1 });
    const urls = (global.fetch as jest.Mock).mock.calls.map(([url]) => new URL(String(url)));
    const listing = urls.find((url) => url.pathname.endsWith("/wc/v3/products") && url.searchParams.get("_fields") !== "id,attributes,meta_data")!;
    expect(listing.searchParams.get("include")).toBe("2,3");
    expect(listing.searchParams.get("category")).toBe("8");
    expect(listing.searchParams.get("page")).toBe("2");
    expect(listing.searchParams.get("per_page")).toBe("1");
    expect(collection.products.map((product) => product.id)).toEqual(["3"]);
    expect(urls.some((url) => url.pathname.includes("/variations"))).toBe(false);
  });

  it("uses audience metadata to separate shared-category products before pagination", async () => {
    const response = (data: unknown, total = "1") => ({
      ok: true,
      status: 200,
      headers: new Headers({ "x-wp-total": total, "x-wp-totalpages": "1" }),
      json: async () => data,
    }) as Response;
    global.fetch = jest.fn(async (input: RequestInfo | URL) => {
      const url = new URL(String(input));
      if (url.searchParams.get("_fields") === "id,attributes,meta_data") {
        return response([
          { id: 21, attributes: [{ name: "Talle", options: ["4 años"] }], meta_data: [{ key: "_minifimy_audiences", value: ["ninas"] }] },
          { id: 22, attributes: [{ name: "Talle", options: ["4 años"] }], meta_data: [{ key: "_minifimy_audiences", value: ["ninos"] }] },
          { id: 23, attributes: [{ name: "Talle", options: ["4 años"] }], meta_data: [] },
        ], "3");
      }
      if (url.pathname.endsWith("/wc/store/v1/products")) return response([]);
      return response([
        { id: 21, name: "Calza", slug: "calza", price: "1200", images: [], attributes: [{ name: "Talle", options: ["4 años"] }], meta_data: [{ key: "_minifimy_audiences", value: ["ninas"] }] },
        { id: 23, name: "Jogger", slug: "jogger", price: "1400", images: [], attributes: [{ name: "Talle", options: ["4 años"] }], meta_data: [] },
      ], "2");
    }) as typeof fetch;

    const { getStoreProductCollection } = await import("@/lib/woocommerce");
    const collection = await getStoreProductCollection({ ageGroup: "ninos", audience: "ninas", category: "8", perPage: 12 });
    const urls = (global.fetch as jest.Mock).mock.calls.map(([url]) => new URL(String(url)));
    const listing = urls.find((url) =>
      url.pathname.endsWith("/wc/v3/products") &&
      url.searchParams.get("_fields") !== "id,attributes,meta_data"
    )!;

    expect(listing.searchParams.get("include")).toBe("21,23");
    expect(collection.products.map((product) => product.id)).toEqual(["21", "23"]);
    expect(urls.some((url) => url.pathname.includes("/variations"))).toBe(false);
  });

  it("returns no products for a selected size outside the category age", async () => {
    global.fetch = jest.fn();
    const { getStoreProductCollection } = await import("@/lib/woocommerce");
    const collection = await getStoreProductCollection({ ageGroup: "bebes", size: "3 años" });
    expect(collection.total).toBe(0);
    expect(collection.products).toEqual([]);
    expect(global.fetch).not.toHaveBeenCalled();
  });

});
