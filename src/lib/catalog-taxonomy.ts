const SIZE_ORDER = [
  "RN", "0–3 meses", "3–6 meses", "6–9 meses", "9–12 meses",
  "12–18 meses", "18–24 meses", "2–3 años", "4 años",
] as const;

const COLOR_ALIASES: Record<string, string> = {
  azul: "Azul", beige: "Beige", blanco: "Blanco", crema: "Crema",
  gris: "Gris", natural: "Natural", negro: "Negro",
  "rosa bebe": "Rosa bebé", "rosa viejo": "Rosa viejo", "verde oliva": "Verde oliva",
};

function comparable(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[–—]/g, "-").replace(/\s+/g, " ").trim();
}

export function normalizeSize(value: string) {
  const normalized = comparable(value)
    .replace(/(\d)\s*m\b/g, "$1 meses")
    .replace(/\b(mes|meses)\b/g, "meses")
    .replace(/\b(ano|anos|año|años)\b/g, "años")
    .replace(/\s*-\s*/g, "–");
  if (normalized === "rn" || normalized === "recien nacido") return "RN";
  const known = SIZE_ORDER.find((size) => comparable(size) === comparable(normalized));
  return known ?? value.trim();
}

export function normalizeColor(value: string) {
  const key = comparable(value);
  return COLOR_ALIASES[key] ?? value.trim().replace(/^./, (letter) => letter.toUpperCase());
}

function uniqueByCanonical(values: Array<string | undefined>, normalize: (value: string) => string) {
  const unique = new Map<string, string>();
  values.forEach((value) => {
    if (!value?.trim()) return;
    const canonical = normalize(value);
    unique.set(comparable(canonical), canonical);
  });
  return Array.from(unique.values());
}

export function normalizeAndSortSizes(values: Array<string | undefined>) {
  const order = new Map(SIZE_ORDER.map((size, index) => [comparable(size), index]));
  return uniqueByCanonical(values, normalizeSize).sort((first, second) => {
    const firstOrder = order.get(comparable(first)) ?? Number.MAX_SAFE_INTEGER;
    const secondOrder = order.get(comparable(second)) ?? Number.MAX_SAFE_INTEGER;
    return firstOrder - secondOrder || first.localeCompare(second, "es");
  });
}

export function normalizeAndSortColors(values: Array<string | undefined>) {
  return uniqueByCanonical(values, normalizeColor)
    .sort((first, second) => first.localeCompare(second, "es"));
}
