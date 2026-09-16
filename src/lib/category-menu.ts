import type { Category } from "@/models/product";

type CategoryMenuLink = { href: string; label: string };

export function withCategoryChildren(link: CategoryMenuLink, categories: Category[]) {
  const pathname = new URL(link.href, "https://minifimy.com").pathname.replace(/\/$/, "");
  const parent = categories.find((category) => pathname === `/catalogo/${category.slug}`);
  const children = parent ? categories.filter((category) => category.parentId === parent.id) : [];

  return children.length ? {
    ...link,
    children: [
      { href: link.href, label: `Ver todo en ${link.label}` },
      ...children.map((category) => ({ href: `/catalogo/${category.slug}`, label: category.name })),
    ],
  } : link;
}
