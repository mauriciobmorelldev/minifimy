import type { Category } from "@/models/product";

export type CatalogAgeGroup = "bebes" | "ninos";

function comparable(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

export function parseAgeGroup(value?: string | null): CatalogAgeGroup | undefined {
  return value === "bebes" || value === "ninos" ? value : undefined;
}

function categoryAgeGroup(category: Category): CatalogAgeGroup | undefined {
  const names = [comparable(category.slug), comparable(category.name)];
  if (names.some((name) => /^(bebe|bebes)$/.test(name))) return "bebes";
  if (names.some((name) => /^(nino|ninos|nina|ninas)$/.test(name))) return "ninos";
}

export function resolveCatalogAge(categories: Category[], slugs: string[], context?: string | null): CatalogAgeGroup | undefined {
  const selected = categories.filter((category) => slugs.includes(category.slug));
  const explicit = new Set(selected.map(categoryAgeGroup).filter(Boolean));
  if (explicit.size) return explicit.size === 1 ? [...explicit][0] : undefined;
  if (parseAgeGroup(context)) return parseAgeGroup(context);
  const inherited = new Set<CatalogAgeGroup>();
  for (const selectedCategory of selected) {
    let category: Category | undefined = selectedCategory;
    const visited = new Set<string>();
    while (category && !visited.has(category.id)) {
      visited.add(category.id);
      const group = categoryAgeGroup(category);
      if (group) { inherited.add(group); break; }
      category = categories.find((item) => item.id === category?.parentId);
    }
  }
  return inherited.size === 1 ? [...inherited][0] : undefined;
}

/** Ranges belong to the age at which they start; unclassified sizes remain visible. */
export function sizeMatchesAge(size: string, group?: CatalogAgeGroup): boolean {
  if (!group) return true;
  const value = comparable(size).replace(/[–—]/g, "-");
  if (/^(rn|recien nacido|talle unico|unico)$/.test(value)) return group === "bebes";
  const match = value.match(/^(\d+(?:[.,]\d+)?)(?:\s*[-a]\s*\d+(?:[.,]\d+)?)?\s*(mes(?:es)?|m|anos?|a)$/);
  if (!match) return true;
  const age = Number(match[1].replace(",", ".")) * (match[2].startsWith("a") ? 12 : 1);
  return group === "bebes" ? age < 36 : age >= 36;
}

export function sizesMatchAge(sizes: string[] | undefined, group: CatalogAgeGroup) {
  return !sizes?.length || sizes.some((size) => sizeMatchesAge(size, group));
}
