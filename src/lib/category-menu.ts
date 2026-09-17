import type { Category } from "@/models/product";
import type { ProductAudience } from "@/lib/catalog-audience";

export type StoreMenuLink = {
  href: string;
  label: string;
  children?: StoreMenuLink[];
};

const PRIMARY_GROUPS = [
  { slug: "bebes", label: "Bebés", ageGroup: "bebes", audience: "bebes" },
  { slug: "ninas", label: "Niñas", ageGroup: "ninos", audience: "ninas" },
  { slug: "ninos", label: "Niños", ageGroup: "ninos", audience: "ninos" },
  { slug: "accesorios", label: "Accesorios", ageGroup: undefined, audience: undefined },
] as const;

function categoryHref(category: Category, ageGroup?: "bebes" | "ninos", audience?: ProductAudience) {
  const params = new URLSearchParams();
  if (ageGroup) params.set("etapa", ageGroup);
  if (audience) params.set("publico", audience);
  const query = params.toString();
  return `/catalogo/${category.slug}${query ? `?${query}` : ""}`;
}

function normalizePathname(pathname: string) {
  const normalized = pathname.replace(/\/+$/, "");
  return normalized || "/";
}

function menuHrefIsActive(href: string, pathname: string, ageContext?: string | null, audienceContext?: string | null) {
  const url = new URL(href, "https://minifimy.com");
  if (normalizePathname(url.pathname) !== normalizePathname(pathname)) return false;

  const linkAudienceContext = url.searchParams.get("publico");
  if (linkAudienceContext || audienceContext) return linkAudienceContext === audienceContext;
  const linkAgeContext = url.searchParams.get("etapa");
  if (linkAgeContext && ageContext) return linkAgeContext === ageContext;
  if (url.pathname === "/catalogo") return linkAgeContext ? linkAgeContext === ageContext : !ageContext;
  return true;
}

export function isStoreMenuGroupActive(group: StoreMenuLink, pathname: string, ageContext?: string | null, audienceContext?: string | null) {
  return [group, ...(group.children ?? [])].some((link) => menuHrefIsActive(link.href, pathname, ageContext, audienceContext));
}

function descendantsOf(parentId: string, categories: Category[]) {
  const descendants: Category[] = [];
  const visited = new Set<string>();
  const collect = (id: string) => {
    if (visited.has(id)) return;
    visited.add(id);
    for (const child of categories.filter((category) => category.parentId === id)) {
      descendants.push(child);
      collect(child.id);
    }
  };
  collect(parentId);
  return descendants;
}

export function buildStoreMenu(categories: Category[]): StoreMenuLink[] {
  const hasProducts = (category: Category, visited = new Set<string>()): boolean => {
    if (visited.has(category.id)) return false;
    visited.add(category.id);
    if (category.productCount === undefined || category.productCount > 0) return true;
    return categories
      .filter((candidate) => candidate.parentId === category.id)
      .some((child) => hasProducts(child, new Set(visited)));
  };
  const visibleCategories = categories.filter((category) =>
    category.slug !== "sin-categorizar" && hasProducts(category)
  );
  const assignedCategoryIds = new Set<string>();

  const primaryGroups = PRIMARY_GROUPS.flatMap(({ slug, label, ageGroup, audience }) => {
    const parent = visibleCategories.find((category) => category.slug === slug);
    if (!parent) return [];

    const descendants = descendantsOf(parent.id, visibleCategories);
    assignedCategoryIds.add(parent.id);
    descendants.forEach((category) => assignedCategoryIds.add(category.id));
    const href = categoryHref(parent, ageGroup, audience);

    return [{
      href,
      label,
      children: [
        { href, label: `Ver todo en ${label}` },
        ...descendants.map((category) => ({
          href: categoryHref(category, ageGroup, audience),
          label: category.name,
        })),
      ],
    }];
  });

  const catalogChildren = visibleCategories
    .filter((category) => !assignedCategoryIds.has(category.id))
    .map((category) => ({ href: categoryHref(category), label: category.name }));

  return [
    ...primaryGroups,
    {
      href: "/catalogo",
      label: "Catálogo",
      children: [
        { href: "/catalogo", label: "Ver catálogo completo" },
        ...catalogChildren,
      ],
    },
  ];
}
