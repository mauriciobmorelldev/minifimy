import { buildStoreMenu, isStoreMenuGroupActive } from "@/lib/category-menu";

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
    href: "/catalogo/bodys?etapa=bebes&publico=bebes",
    label: "Bodies",
  });
  expect(girls?.children).toContainEqual({
    href: "/catalogo/vestidos?etapa=ninos&publico=ninas",
    label: "Vestidos",
  });
  expect(catalog?.children?.map((child) => child.label)).toEqual([
    "Ver catálogo completo",
    "Nueva Temporada",
    "Oportunidades",
  ]);
});

it("hides a primary group until its WooCommerce category exists with products", () => {
  expect(buildStoreMenu(categories).find((group) => group.label === "Niños")).toBeUndefined();

  const withBoys = buildStoreMenu([
    ...categories,
    { id: "8", name: "Niños", slug: "ninos", description: "", productCount: 2 },
  ]).find((group) => group.label === "Niños");

  expect(withBoys).toEqual({
    href: "/catalogo/ninos?etapa=ninos&publico=ninos",
    label: "Niños",
    children: [
      { href: "/catalogo/ninos?etapa=ninos&publico=ninos", label: "Ver todo en Niños" },
    ],
  });
});

it("highlights only the mobile group represented by the current route and age context", () => {
  const menu = buildStoreMenu(categories);
  const activeLabels = (pathname: string, ageContext?: string, audienceContext?: string) =>
    menu.filter((group) => isStoreMenuGroupActive(group, pathname, ageContext, audienceContext)).map((group) => group.label);

  expect(
    menu.filter((group) => isStoreMenuGroupActive(group, "/catalogo/bebes", "bebes", "bebes")).map((group) => group.label),
  ).toEqual(["Bebés"]);
  expect(activeLabels("/catalogo")).toEqual(["Catálogo"]);
  expect(activeLabels("/catalogo/bodys", "bebes", "bebes")).toEqual(["Bebés"]);
  expect(activeLabels("/catalogo/accesorios")).toEqual(["Accesorios"]);

});


it("omits empty categories but keeps a parent whose child contains products", () => {
  const menu = buildStoreMenu([
    { id: "10", name: "Bebés", slug: "bebes", description: "", productCount: 0 },
    { id: "11", name: "Bodies", slug: "bodies", parentId: "10", description: "", productCount: 2 },
    { id: "12", name: "Vacía", slug: "vacia", description: "", productCount: 0 },
  ]);
  const babies = menu.find((group) => group.label === "Bebés");
  const catalog = menu.find((group) => group.label === "Catálogo");

  expect(babies?.children?.map((child) => child.label)).toContain("Bodies");
  expect(catalog?.children?.map((child) => child.label)).not.toContain("Vacía");
});


it("shows one shared category under multiple menu parents with the correct audience", () => {
  const menu = buildStoreMenu([
    ...categories,
    { id: "8", name: "Ni\u00f1os", slug: "ninos", description: "", productCount: 0 },
    {
      id: "9",
      name: "Partes de abajo",
      slug: "partes-de-abajo",
      description: "",
      productCount: 4,
      menuParentSlugs: ["ninas", "ninos"],
    },
  ]);
  const girls = menu.find((group) => group.label === "Ni\u00f1as");
  const boys = menu.find((group) => group.label === "Ni\u00f1os");
  const catalog = menu.find((group) => group.label === "Cat\u00e1logo");

  expect(girls?.children).toContainEqual({
    href: "/catalogo/partes-de-abajo?etapa=ninos&publico=ninas",
    label: "Partes de abajo",
  });
  expect(boys?.children).toContainEqual({
    href: "/catalogo/partes-de-abajo?etapa=ninos&publico=ninos",
    label: "Partes de abajo",
  });
  expect(catalog?.children?.map((child) => child.label)).not.toContain("Partes de abajo");
});

it("keeps a menu parent when only an additional child contains products", () => {
  const menu = buildStoreMenu([
    { id: "20", name: "Ni\u00f1os", slug: "ninos", description: "", productCount: 0 },
    {
      id: "21",
      name: "Partes de arriba",
      slug: "partes-de-arriba",
      description: "",
      productCount: 3,
      menuParentSlugs: ["ninos"],
    },
    {
      id: "22",
      name: "Categoria vacia",
      slug: "categoria-vacia",
      description: "",
      productCount: 0,
      menuParentSlugs: ["ninos"],
    },
  ]);
  const boys = menu.find((group) => group.label === "Ni\u00f1os");

  expect(boys?.children?.map((child) => child.label)).toContain("Partes de arriba");
  expect(boys?.children?.map((child) => child.label)).not.toContain("Categoria vacia");
});
