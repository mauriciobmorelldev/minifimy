import { fireEvent, render, screen } from "@testing-library/react";
import { HomeAgeFilter } from "@/components/HomeAgeFilter";

jest.mock("@/components/ScrollReveal", () => ({
  ScrollReveal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const scrollBy = jest.fn();

beforeAll(() => {
  Object.defineProperty(global, "ResizeObserver", {
    configurable: true,
    value: class {
      observe() {}
      disconnect() {}
    },
  });
  Object.defineProperty(HTMLElement.prototype, "clientWidth", { configurable: true, value: 320 });
  Object.defineProperty(HTMLElement.prototype, "scrollWidth", { configurable: true, value: 960 });
  Object.defineProperty(HTMLElement.prototype, "scrollBy", { configurable: true, value: scrollBy });
});

beforeEach(() => {
  scrollBy.mockClear();
});

it("keeps age ranges together and advances with the carousel arrow", () => {
  render(<HomeAgeFilter sizes={["12–18 meses", "18–24 meses", "4 años", "5 años", "6 años"]} />);

  expect(screen.getByRole("link", { name: "Ver prendas en talle 12–18 meses para bebés" })).toHaveAttribute(
    "href",
    "/catalogo?talle=12%E2%80%9318%20meses&etapa=bebes",
  );
  expect(screen.getByText("12–18")).toHaveClass("whitespace-nowrap");
  expect(screen.getByText("18–24")).toHaveClass("whitespace-nowrap");

  fireEvent.click(screen.getByRole("button", { name: "Ver más talles" }));
  expect(scrollBy).toHaveBeenCalledWith({
    left: 280,
    behavior: "smooth",
  });
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
    expect(link.firstElementChild).toHaveClass(stage === "bebes" ? "bg-secondary-container" : "bg-[#edf0e2]");
    expect(link).not.toHaveTextContent(/Bebés|Niños\/Niñas/);
  }
});
