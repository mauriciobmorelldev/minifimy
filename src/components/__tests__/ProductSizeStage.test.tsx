import { fireEvent, render, screen } from "@testing-library/react";
import { ProductDetailClient } from "@/components/ProductDetailClient";
import type { Product, ProductSelection } from "@/models/product";

jest.mock("@/components/ProductGallery", () => ({ ProductGallery: () => null }));
jest.mock("@/components/ProductInfoModal", () => ({ ProductInfoModal: () => null, WhatsAppIcon: () => null }));
jest.mock("@/components/AddToCartButton", () => ({
  AddToCartButton: ({ selection, disabled }: { selection: ProductSelection; disabled: boolean }) => (
    <button data-testid="cart-selection" data-selection={JSON.stringify(selection)} disabled={disabled}>Comprar</button>
  ),
}));

const product: Product = {
  id: "1", name: "Pantalón", slug: "pantalon", description: "Pantalón", category: "pantalones",
  type: "variable", price: 1000, stock: 10, images: [], colors: ["Azul", "Rosa"],
  sizes: ["4 · Bebés", "6 · Bebés", "4 · Niños/Niñas", "8 · Niños/Niñas"],
  variants: [
    { id: "b4", size: "4 · Bebés", color: "Azul", price: 1000, stock: 2, variationAttributes: [{ attribute: "Talle", value: "4 · Bebés" }] },
    { id: "b6", size: "6 · Bebés", color: "Rosa", price: 1100, stock: 2 },
    { id: "n4", size: "4 · Niños/Niñas", color: "Rosa", price: 2000, stock: 2, variationAttributes: [{ attribute: "Talle", value: "4 · Niños/Niñas" }] },
    { id: "n8", size: "8 · Niños/Niñas", color: "Rosa", price: 2100, stock: 0 },
  ],
};

function selection(): ProductSelection {
  return JSON.parse(screen.getByTestId("cart-selection").getAttribute("data-selection")!);
}

it("switches the same visible size between stages and sends the correct variation to cart", () => {
  render(<ProductDetailClient product={product} categoryName="Pantalones" />);
  const stage = screen.getByRole("combobox", { name: "Elegí la etapa" });
  expect(stage).toHaveValue("bebes");
  expect(screen.getAllByRole("button", { name: "4" })).toHaveLength(1);
  expect(screen.getByRole("button", { name: "6" })).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "8" })).not.toBeInTheDocument();
  expect(selection().variationId).toBe("b4");

  fireEvent.change(stage, { target: { value: "ninos" } });
  expect(screen.queryByRole("button", { name: "6" })).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "8" })).toBeInTheDocument();
  expect(selection()).toMatchObject({ size: "4 · Niños/Niñas", color: "Rosa", variationId: "n4", variationAttributes: [{ attribute: "Talle", value: "4 · Niños/Niñas" }] });
  expect(screen.getByTestId("cart-selection")).toBeEnabled();

  // Azul exists only for babies: choosing it must not silently change stage.
  fireEvent.click(screen.getByRole("button", { name: "Azul" }));
  expect(stage).toHaveValue("ninos");
  expect(selection()).toMatchObject({ size: "4 · Niños/Niñas", color: "Azul" });
  expect(selection().variationId).toBeUndefined();
  expect(screen.getByTestId("cart-selection")).toBeDisabled();

  fireEvent.change(stage, { target: { value: "bebes" } });
  expect(selection()).toMatchObject({ size: "4 · Bebés", variationId: "b4" });
  expect(screen.getByTestId("cart-selection")).toBeEnabled();
});

it("keeps out-of-stock sizes in their stage and prevents purchasing them", () => {
  render(<ProductDetailClient product={product} categoryName="Pantalones" />);
  fireEvent.change(screen.getByRole("combobox"), { target: { value: "ninos" } });
  fireEvent.click(screen.getByRole("button", { name: "8" }));
  expect(selection()).toMatchObject({ size: "8 · Niños/Niñas", variationId: "n8" });
  expect(screen.getByTestId("cart-selection")).toBeDisabled();
});

it("selects a size from the new stage when the previous size does not exist there", () => {
  render(<ProductDetailClient product={product} categoryName="Pantalones" />);
  fireEvent.click(screen.getByRole("button", { name: "6" }));
  fireEvent.change(screen.getByRole("combobox"), { target: { value: "ninos" } });
  expect(selection()).toMatchObject({ size: "4 · Niños/Niñas", variationId: "n4" });
});

it("preserves legacy products and exposes unclassified sizes separately in mixed products", () => {
  const { unmount } = render(<ProductDetailClient product={{ ...product, sizes: ["4"], variants: [{ id: "old", size: "4", stock: 2 }] }} categoryName="Pantalones" />);
  expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "4" })).toBeInTheDocument();
  unmount();
  render(<ProductDetailClient product={{ ...product, sizes: [...product.sizes!, "Especial"] }} categoryName="Pantalones" />);
  fireEvent.change(screen.getByRole("combobox"), { target: { value: "" } });
  expect(screen.getByRole("button", { name: "Especial" })).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "4" })).not.toBeInTheDocument();
  expect(screen.getByTestId("cart-selection")).toBeDisabled();
});
