import type { Category } from "@/models/product";

export type StoreMenuLink = {
  href: string;
  label: string;
  children?: StoreMenuLink[];
};

const PRIMARY_GROUPS = [
  { slug: "bebes", label: "Bebés", ageGroup: "bebes" },
  { slug: "ninas", label: "Niñas", ageGroup: "ninos" },
  { slug: "ninos", label: "Niños", ageGroup: "ninos" },
  { slug: "accesorios", label: "Accesorios", ageGroup: undefined },
] as const;

function categoryHref(category: Category, ageGroup?: "bebes" | "ninos") {
  return `/catalogo/${category.slug}${ageGroup ? `?etapa=${ageGroup}` : ""}`;
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
  const visibleCategories = categories.filter((category) => category.slug !== "sin-categorizar");
  const assignedCategoryIds = new Set<string>();

  const primaryGroups = PRIMARY_GROUPS.map(({ slug, label, ageGroup }) => {
    const parent = visibleCategories.find((category) => category.slug === slug);
    const descendants = parent ? descendantsOf(parent.id, visibleCategories) : [];
    if (parent) assignedCategoryIds.add(parent.id);
    descendants.forEach((category) => assignedCategoryIds.add(category.id));

    const href = parent
      ? categoryHref(parent, ageGroup)
      : `/catalogo?etapa=${ageGroup ?? "ninos"}`;

    return {
      href,
      label,
      children: [
        { href, label: `Ver todo en ${label}` },
        ...descendants.map((category) => ({
          href: categoryHref(category, ageGroup),
          label: category.name,
        })),
      ],
    };
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
