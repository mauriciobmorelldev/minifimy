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

  expect(screen.getByRole("link", { name: "Ver prendas en talle 12–18 meses" })).toHaveAttribute(
    "href",
    "/catalogo?talle=12%E2%80%9318%20meses",
  );
  expect(screen.getByText("12–18")).toHaveClass("whitespace-nowrap");
  expect(screen.getByText("18–24")).toHaveClass("whitespace-nowrap");

  fireEvent.click(screen.getByRole("button", { name: "Ver más talles" }));
  expect(scrollBy).toHaveBeenCalledWith({
    left: 280,
    behavior: "smooth",
  });
});

it("shows a single plain size while keeping both stages in the filter query", () => {
  render(<HomeAgeFilter sizes={["4 · Bebés", "4 · Niños/Niñas"]} />);
  expect(screen.getAllByText("4")).toHaveLength(1);
  expect(screen.queryByText(/Bebés|Niños\/Niñas/)).not.toBeInTheDocument();
  const link = screen.getByRole("link", { name: "Ver prendas en talle 4" });
  const url = new URL(link.getAttribute("href")!, "https://minifimy.com");
  expect(url.searchParams.getAll("talle")).toEqual(["4 · Bebés", "4 · Niños/Niñas"]);
});
