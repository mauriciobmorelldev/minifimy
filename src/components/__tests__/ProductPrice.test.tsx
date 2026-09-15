import { render, screen } from "@testing-library/react";
import { getDisplayPrice, ProductPrice } from "@/components/ProductPrice";

describe("getDisplayPrice", () => {
  it("keeps the configured list price above the transfer price", () => {
    expect(getDisplayPrice(19_200, { base: 19_200, list: 34_300, discount: 24_010 })).toMatchObject({
      listPrice: 34_300,
      finalPrice: 24_010,
      transferPrice: 24_010,
      hasDiscount: true,
      discountPercent: 30,
    });
  });

  it("falls back to the base product price when no separate list exists", () => {
    expect(getDisplayPrice(14_900, { base: 14_900 })).toMatchObject({
      listPrice: 14_900,
      finalPrice: 14_900,
      hasDiscount: false,
    });
  });
});

describe("ProductPrice", () => {
  it("renders every monetary amount with a single currency symbol", () => {
    const { container } = render(
      <ProductPrice price={24_010} prices={{ base: 24_010, list: 34_300, discount: 24_010 }} />,
    );

    expect(screen.getByText("Precio de lista: $34.300")).toBeInTheDocument();
    expect(screen.getByText("Precio por transferencia: $24.010")).toBeInTheDocument();
    expect(screen.getByText("3 cuotas sin interés de $11.433")).toBeInTheDocument();
    expect(container.textContent).not.toContain("$$");
  });

  it("uses the full interest-free installment copy on catalog cards", () => {
    const { container } = render(
      <ProductPrice price={27_900} prices={{ base: 27_900 }} compact />,
    );

    expect(screen.getByText("3 cuotas sin interés · $9.300")).toBeInTheDocument();
    expect(container.textContent).not.toContain("3x");
  });
});
