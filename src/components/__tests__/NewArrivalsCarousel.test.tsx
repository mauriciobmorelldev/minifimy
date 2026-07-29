import { act, render, screen } from "@testing-library/react";
import { NewArrivalsCarousel } from "@/components/NewArrivalsCarousel";
import type { Product } from "@/models/product";

jest.mock("@/components/ProductCard", () => ({
  ProductCard: ({ product }: { product: Product }) => <article>{product.name}</article>,
}));

const products: Product[] = [
  {
    id: "one",
    name: "Body Nube",
    slug: "body-nube",
    description: "",
    price: 100,
    images: ["/one.jpg"],
    category: "body",
    stock: 2,
  },
  {
    id: "two",
    name: "Ranita Sol",
    slug: "ranita-sol",
    description: "",
    price: 200,
    images: ["/two.jpg"],
    category: "ranita",
    stock: 2,
  },
];

describe("NewArrivalsCarousel", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: jest.fn().mockReturnValue({ matches: false }),
    });
    Object.defineProperty(HTMLElement.prototype, "scrollBy", {
      configurable: true,
      value: jest.fn(),
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("avanza automáticamente y mantiene controles manuales", () => {
    render(<NewArrivalsCarousel products={products} />);

    expect(screen.getByRole("button", { name: "Ver productos anteriores" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ver productos siguientes" })).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(2400);
    });

    expect(HTMLElement.prototype.scrollBy).toHaveBeenCalledWith({ left: expect.any(Number), behavior: "smooth" });
  });
});
