import { formatBlackFridayInstallment, getBlackFridayPrice, getBlackFridayTransferSubtotal } from "@/lib/black-friday";
import { getBlackFridayCatalogOffer, getBlackFridaySaleProducts } from "@/lib/black-friday-products";
import { getStoreCategories, getStoreProductCollection } from "@/lib/woocommerce";
import type { Product } from "@/models/product";

jest.mock("@/lib/woocommerce", () => ({
  getStoreCategories: jest.fn(),
  getStoreProductCollection: jest.fn(),
}));

function product(id: string, price: number, overrides: Partial<Product> = {}): Product {
  return { id, slug: id, name: id, description: "", price, category: "ropa", stock: 1, images: [], ...overrides };
}

describe("Black Friday", () => {
  it("uses the lowest available card price excluding accessories and their subcategories", async () => {
    jest.mocked(getStoreProductCollection)
      .mockResolvedValueOnce({
        products: [product("gorro", 1_800, { categoryIds: ["gorros"] }), product("variable", 9000, {
          prices: { base: 9_000, list: 9_000 },
          variants: [
            { id: "unavailable", price: 9_000, stock: 0 },
            { id: "available", price: 18_000, stock: 1 },
          ],
        })],
        total: 4, totalPages: 2, page: 1, perPage: 100,
      })
      .mockResolvedValueOnce({
        products: [
          product("babero", 1_500, { categorySlugs: ["accesorios"] }),
          product("simple", 7_500, { prices: { base: 7_500, list: 15_000 }, images: ["/simple.jpg"] }),
        ],
        total: 4, totalPages: 2, page: 2, perPage: 100,
      });

    const offer = await getBlackFridayCatalogOffer({ category: "ropa" }, [
      { id: "gorros", slug: "gorros", name: "Gorros", description: "", parentId: "accessories" },
      { id: "accessories", slug: "accesorios", name: "Accesorios", description: "" },
    ]);
    expect(offer).toEqual({ cardPrice: 15_000, image: "/simple.jpg" });
    expect(formatBlackFridayInstallment(offer!.cardPrice)).toBe("$2.500");
  });

  it("replaces an existing discount instead of applying 50% on top of it", () => {
    expect(getBlackFridayPrice(80_000, { base: 80_000, list: 100_000, discount: 80_000 }))
      .toEqual({ original: 100_000, final: 50_000 });
    expect(getBlackFridayPrice(10_001)).toEqual({ original: 10_001, final: 5_000.5 });
  });

  it("counts quantities at the campaign transfer price toward free shipping", () => {
    expect(getBlackFridayTransferSubtotal([
      { id: "first", product: product("first", 80_000, { prices: { base: 80_000, list: 100_000, discount: 80_000 } }), quantity: 2 },
      { id: "second", product: product("second", 15_000), quantity: 1 },
    ])).toBe(107_500);
  });

  it("ranks in-stock products across catalogue pages and excludes accessory descendants", async () => {
    jest.mocked(getStoreCategories).mockResolvedValue([
      { id: "child", slug: "gorros", name: "Gorros", description: "", parentId: "accessories" },
      { id: "accessories", slug: "accesorios", name: "Accesorios", description: "" },
      { id: "dress-category", slug: "vestidos", name: "Vestidos", description: "" },
    ]);
    jest.mocked(getStoreProductCollection)
      .mockResolvedValueOnce({
        products: [
          product("accesorio", 1, { category: "accesorios" }),
          product("gorro", 10, { categoryId: "child" }),
          product("sin-stock", 20, { stock: 0 }),
          product("rebajado", 80, { prices: { base: 80, list: 200, discount: 80 } }),
          product("vestido-sin-stock", 2, { categoryIds: ["dress-category"], stock: 0 }),
        ],
        total: 6, totalPages: 2, page: 1, perPage: 100,
      })
      .mockResolvedValueOnce({
        products: [product("ropa", 150, { categoryIds: ["dress-category"], images: ["/vestido.jpg"] })],
        total: 6, totalPages: 2, page: 2, perPage: 100,
      });

    const { flashSale, categoryOffers } = await getBlackFridaySaleProducts();
    expect(flashSale.map(({ id }) => id)).toEqual(["ropa", "rebajado"]);
    expect(categoryOffers.find(({ label }) => label === "Vestidos")).toEqual({
      label: "Vestidos", href: "/catalogo/vestidos", price: 75, image: "/vestido.jpg",
    });
  });

  it("adds selected Flash Sale products beyond the four cheapest without duplicates", async () => {
    jest.mocked(getStoreCategories).mockResolvedValue([]);
    const products = [
      product("blusa-pauli", 10),
      product("ropa-1", 20),
      product("ropa-2", 30),
      product("ropa-3", 40),
      product("ropa-4", 50),
      product("pantalon-julian", 60),
      product("buzo-a-rayas-friza", 70, { stock: 0 }),
    ];
    jest.mocked(getStoreProductCollection).mockResolvedValue({
      products, total: products.length, totalPages: 1, page: 1, perPage: 100,
    });

    const { flashSale } = await getBlackFridaySaleProducts();
    expect(flashSale.map(({ slug }) => slug)).toEqual([
      "blusa-pauli", "ropa-1", "ropa-2", "ropa-3", "pantalon-julian",
    ]);
  });

  it("includes only purchasable products marked as combos", async () => {
    jest.mocked(getStoreCategories).mockResolvedValue([
      { id: "combo-category", slug: "combos", name: "Combos", description: "" },
    ]);
    const products = [
      product("por-categoria", 60, { categoryIds: ["combo-category"] }),
      product("por-etiqueta", 40, { tagSlugs: ["combo"] }),
      product("por-slug", 50, { categorySlugs: ["combos"] }),
      product("sin-stock", 30, { stock: 0, tagSlugs: ["combos"] }),
      product("conjuntos", 20, { category: "conjuntos" }),
    ];
    jest.mocked(getStoreProductCollection).mockResolvedValue({
      products, total: products.length, totalPages: 1, page: 1, perPage: 100,
    });

    const { combosSale } = await getBlackFridaySaleProducts();
    expect(combosSale.map(({ id }) => id)).toEqual(["por-etiqueta", "por-slug", "por-categoria"]);
  });
});
