import {
  normalizeAndSortColors,
  normalizeAndSortSizes,
  normalizeColor,
  normalizeSize,
} from "@/lib/catalog-taxonomy";

describe("catalog taxonomy normalization", () => {
  it("deduplicates color aliases and preserves canonical accents", () => {
    expect(normalizeAndSortColors(["azul", "Azul", "Rosa bebe", "rosa bebé"])).toEqual([
      "Azul",
      "Rosa bebé",
    ]);
    expect(normalizeColor("verde oliva")).toBe("Verde oliva");
  });

  it("sorts known baby sizes before unknown values", () => {
    expect(normalizeAndSortSizes(["12-18 Meses", "3–6 meses", "RN", "Especial", "0-3m"])).toEqual([
      "RN",
      "0–3 meses",
      "3–6 meses",
      "12–18 meses",
      "Especial",
    ]);
    expect(normalizeSize("4 anos")).toBe("4 años");
    expect(normalizeSize("6-9 meses")).toBe("6–9 meses");
    expect(normalizeSize("6–9 meses")).toBe("6–9 meses");
  });
});
