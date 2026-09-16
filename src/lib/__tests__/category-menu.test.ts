import { withCategoryChildren } from "@/lib/category-menu";

const categories = [
  { id: "1", name: "Bebés", slug: "bebes", description: "" },
  { id: "2", name: "Niñas", slug: "ninas", description: "" },
  { id: "3", name: "Bodies", slug: "bodies", parentId: "1", description: "" },
  { id: "4", name: "Vestidos", slug: "vestidos", parentId: "2", description: "" },
];

it("groups only the children of each parent and preserves its full catalog link", () => {
  expect(withCategoryChildren({ href: "/catalogo/bebes", label: "Bebés" }, categories)).toEqual({
    href: "/catalogo/bebes", label: "Bebés", children: [
      { href: "/catalogo/bebes", label: "Ver todo en Bebés" },
      { href: "/catalogo/bodies?etapa=bebes", label: "Bodies" },
    ],
  });
  expect(withCategoryChildren({ href: "/catalogo/ninas/", label: "Niñas" }, categories)).toMatchObject({
    children: [
      { href: "/catalogo/ninas/", label: "Ver todo en Niñas" },
      { href: "/catalogo/vestidos?etapa=ninos", label: "Vestidos" },
    ],
  });
});

it("keeps leaf categories and unrelated links as direct links", () => {
  for (const href of ["/catalogo/bodies", "/contacto"]) {
    const link = { href, label: "Enlace" };
    expect(withCategoryChildren(link, categories)).toEqual(link);
  }
});
