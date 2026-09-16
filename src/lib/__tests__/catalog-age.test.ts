import { resolveCatalogAge, sizeMatchesAge, sizesMatchAge } from "@/lib/catalog-age";
import { catalogUrl } from "@/lib/catalog-facets";

it.each([
  ["RN", true], ["Talle único", true], ["0–3 meses", true], ["18–24 meses", true],
  ["2–3 años", true], ["35 meses", true], ["36 meses", false],
  ["3 años", false], ["4 anos", false], ["3–6 años", false],
])("assigns %s to the correct side of the three-year boundary", (size, baby) => {
  expect(sizeMatchesAge(size, "bebes")).toBe(baby);
  expect(sizeMatchesAge(size, "ninos")).toBe(!baby);
});

it("allows mixed sizes in both groups and keeps products without age classification", () => {
  for (const group of ["bebes", "ninos"] as const) {
    expect(sizesMatchAge(["12–18 meses", "4 años"], group)).toBe(true);
    expect(sizesMatchAge(undefined, group)).toBe(true);
  }
});

const categories = [
  { id: "1", name: "Bebés", slug: "bebes", description: "" },
  { id: "2", name: "Niña", slug: "nina", description: "" },
  { id: "3", name: "Partes de abajo", slug: "partes-de-abajo", parentId: "1", description: "" },
];
it("inherits the parent and preserves an explicit context for shared subcategories", () => {
  expect(resolveCatalogAge(categories, ["partes-de-abajo"])).toBe("bebes");
  expect(resolveCatalogAge(categories, ["partes-de-abajo"], "ninos")).toBe("ninos");
  expect(resolveCatalogAge(categories, ["nina"], "bebes")).toBe("ninos");
  expect(resolveCatalogAge(categories, [])).toBeUndefined();
  expect(resolveCatalogAge(categories, ["bebes", "nina"])).toBeUndefined();
});
it("preserves age context with filters, sorting and pagination", () => {
  const url = catalogUrl({ etapa: "ninos", q: "", categoria: ["partes-de-abajo"], talle: ["4 años"], color: [], precio: "all", orden: "price-asc" }, 2);
  const parsed = new URL(url, "https://minifimy.com");
  expect(parsed.pathname).toBe("/catalogo/partes-de-abajo");
  expect(parsed.searchParams.get("etapa")).toBe("ninos");
  expect(parsed.searchParams.get("page")).toBe("2");
  expect(parsed.searchParams.get("talle")).toBe("4 años");
});
