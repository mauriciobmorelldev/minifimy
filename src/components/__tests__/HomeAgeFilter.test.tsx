import { fireEvent, render, screen, within } from "@testing-library/react";
import { HomeAgeFilter } from "@/components/HomeAgeFilter";

jest.mock("@/components/ScrollReveal", () => ({
  ScrollReveal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

it("shows the full size grid with age units and stage labels", () => {
  render(<HomeAgeFilter sizes={["12–18 meses", "18–24 meses", "4 años", "5 años", "6 años"]} />);

  expect(screen.getByRole("link", { name: "Ver prendas en talle 12–18 meses para bebés" })).toHaveAttribute(
    "href",
    "/catalogo?talle=12%E2%80%9318%20meses&etapa=bebes",
  );
  expect(screen.getByText("12–18")).toHaveClass("whitespace-nowrap");
  expect(screen.getByText("18–24")).toHaveClass("whitespace-nowrap");

  expect(within(screen.getByRole("region", { name: "Bebés" })).getAllByText("Baby")).toHaveLength(2);
  expect(within(screen.getByRole("region", { name: "Niños y niñas" })).getAllByText("Kids")).toHaveLength(3);
});

it("puts babies first from RN, uses natural numeric order and keeps stage filters separate", () => {
  render(<HomeAgeFilter sizes={["T10 · Niños/Niñas", "T4 · Bebés", "4 años", "T2 · Bebés", "RN · Bebés", "T4 · Niños/Niñas", "T1 · Bebés"]} />);
  const links = screen.getAllByRole("link").filter((link) => link.getAttribute("aria-label")?.startsWith("Ver prendas en talle"));
  expect(links.map((link) => link.getAttribute("aria-label"))).toEqual([
    "Ver prendas en talle RN para bebés", "Ver prendas en talle 1 para bebés", "Ver prendas en talle 2 para bebés", "Ver prendas en talle 4 para bebés",
    "Ver prendas en talle 4 para niños y niñas", "Ver prendas en talle 10 para niños y niñas",
  ]);
  for (const stage of ["bebes", "ninos"]) {
    const link = screen.getByRole("link", { name: `Ver prendas en talle 4 para ${stage === "bebes" ? "bebés" : "niños y niñas"}` });
    const url = new URL(link.getAttribute("href")!, "https://minifimy.com");
    expect(url.searchParams.getAll("talle")).toEqual(stage === "bebes" ? ["T4 · Bebés"] : ["4 años", "T4 · Niños/Niñas"]);
    expect(url.searchParams.get("etapa")).toBe(stage);
    expect(link).toHaveTextContent(stage === "bebes" ? "4Baby" : "4Kids");
  }
});

it("switches the mobile group from Baby to Kids while retaining the desktop groups", () => {
  render(<HomeAgeFilter sizes={["RN · Bebés", "4 · Niños/Niñas"]} />);
  const switcher = within(screen.getByRole("group", { name: "Etapa del talle" }));
  const baby = switcher.getByRole("button", { name: "Baby" });
  const kids = switcher.getByRole("button", { name: "Kids" });
  const babyPanel = screen.getByRole("region", { name: "Bebés" });
  const kidsPanel = screen.getByRole("region", { name: "Niños y niñas" });

  expect(baby).toHaveAttribute("aria-pressed", "true");
  expect(kidsPanel).toHaveClass("hidden", "sm:block");

  fireEvent.click(kids);

  expect(kids).toHaveAttribute("aria-pressed", "true");
  expect(kids).toHaveAttribute("aria-controls", kidsPanel.id);
  expect(baby).toHaveAttribute("aria-pressed", "false");
  expect(babyPanel).toHaveClass("hidden", "sm:block");
  expect(kidsPanel).not.toHaveClass("hidden");
});
