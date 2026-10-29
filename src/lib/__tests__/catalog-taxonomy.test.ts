import {
  normalizeAndSortColors,
  normalizeAndSortSizes,
  normalizeColor,
  normalizeSize,
  getSizeLabel,
  groupSizesByLabel,
} from "@/lib/catalog-taxonomy";

describe("catalog taxonomy normalization", () => {
  it("hides stages only for display without losing internal filter identities", () => {
    expect(getSizeLabel("4 · Bebés")).toBe("4");
    expect(getSizeLabel("4 · Niños/Niñas")).toBe("4");
    expect(getSizeLabel("0–3 meses · Bebés")).toBe("0–3 meses");
    expect(getSizeLabel("Especial · Marca")).toBe("Especial · Marca");
    expect(groupSizesByLabel(["4", "4 · Bebés", "4 · Niños/Niñas", "6 · Niños/Niñas"])).toEqual([
      { label: "4", values: ["4", "4 · Bebés", "4 · Niños/Niñas"] },
      { label: "6", values: ["6 · Niños/Niñas"] },
    ]);
  });
  it("preserves distinct stage identities while normalizing their base sizes", () => {
    expect(normalizeSize("4 anos · bebes")).toBe("4 años · Bebés");
    expect(normalizeSize("0-3m · Niños/Niñas")).toBe("0–3 meses · Niños/Niñas");
    expect(normalizeAndSortSizes(["4", "4 · Bebés", "4 · bebes", "4 · Niños/Niñas"])).toEqual([
      "4", "4 · Bebés", "4 · Niños/Niñas",
    ]);
  });
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
