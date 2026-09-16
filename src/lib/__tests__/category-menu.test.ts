import { buildStoreMenu } from "@/lib/category-menu";

const categories = [
  { id: "1", name: "Bebés", slug: "bebes", description: "" },
  { id: "2", name: "Niñas", slug: "ninas", description: "" },
  { id: "3", name: "Bodies", slug: "bodys", parentId: "1", description: "" },
  { id: "4", name: "Vestidos", slug: "vestidos", parentId: "2", description: "" },
  { id: "5", name: "Accesorios", slug: "accesorios", description: "" },
  { id: "6", name: "Nueva Temporada", slug: "nueva-temporada", description: "" },
  { id: "7", name: "Oportunidades", slug: "ultimas-oportunidades", description: "" },
];

it("orders the primary groups before the remaining catalog", () => {
  expect(buildStoreMenu(categories).map((group) => group.label)).toEqual([
    "Bebés",
    "Niñas",
    "Niños",
    "Accesorios",
    "Catálogo",
  ]);
});

it("keeps children in their main group and removes those duplicates from Catalog", () => {
  const menu = buildStoreMenu(categories);
  const babies = menu.find((group) => group.label === "Bebés");
  const girls = menu.find((group) => group.label === "Niñas");
  const catalog = menu.find((group) => group.label === "Catálogo");

  expect(babies?.children).toContainEqual({
    href: "/catalogo/bodys?etapa=bebes",
    label: "Bodies",
  });
  expect(girls?.children).toContainEqual({
    href: "/catalogo/vestidos?etapa=ninos",
    label: "Vestidos",
  });
  expect(catalog?.children?.map((child) => child.label)).toEqual([
    "Ver catálogo completo",
    "Nueva Temporada",
    "Oportunidades",
  ]);
});

it("shows Niños now as an age-filtered group until its WooCommerce parent exists", () => {
  const boys = buildStoreMenu(categories).find((group) => group.label === "Niños");

  expect(boys).toEqual({
    href: "/catalogo?etapa=ninos",
    label: "Niños",
    children: [
      { href: "/catalogo?etapa=ninos", label: "Ver todo en Niños" },
    ],
  });
});
