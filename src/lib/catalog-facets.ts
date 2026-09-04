/** Repeated query parameters keep labels containing commas unambiguous. */
export function facetValues(value?: string | string[] | null): string[] {
  return [...new Set((Array.isArray(value) ? value : value ? [value] : [])
    .map((item) => item.trim()).filter((item) => item && item !== "all"))].slice(0, 20);
}

export function toggleFacet(values: string[], value: string): string[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

export type CatalogSelection = {
  q: string;
  categoria: string[];
  talle: string[];
  color: string[];
  precio: string;
  orden: string;
};

export function catalogUrl(selection: CatalogSelection, page = 1) {
  const params = new URLSearchParams();
  const categories = facetValues(selection.categoria);
  const path = categories.length === 1 ? `/catalogo/${encodeURIComponent(categories[0])}` : "/catalogo";
  if (categories.length > 1) categories.forEach((value) => params.append("categoria", value));
  for (const key of ["talle", "color"] as const) {
    facetValues(selection[key]).forEach((value) => params.append(key, value));
  }
  if (selection.q.trim()) params.set("q", selection.q.trim());
  if (selection.precio && selection.precio !== "all") params.set("precio", selection.precio);
  if (selection.orden && selection.orden !== "featured") params.set("orden", selection.orden);
  if (page > 1) params.set("page", String(page));
  return `${path}${params.size ? `?${params}` : ""}`;
}
