import { render, screen } from "@testing-library/react";
import { ProductCard } from "@/components/ProductCard";
import { CartProvider } from "@/context/cart-context";
import { FeedbackProvider } from "@/context/feedback-context";
import type { Product } from "@/models/product";

const product: Product = {
  id: "test",
  name: "Body Nube",
  slug: "body-nube",
  description: "Algodón orgánico.",
  price: 12900,
  images: ["/brand/banners/banner-foto.jpg"],
  category: "recien-nacido",
  stock: 5,
};

describe("ProductCard", () => {
  it("renders product info", () => {
    render(
      <FeedbackProvider>
        <CartProvider>
          <ProductCard product={product} />
        </CartProvider>
      </FeedbackProvider>
    );

    expect(screen.getByText("Body Nube")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Body Nube" })).toHaveAttribute("href", "/producto/body-nube");
    expect(screen.getByText(/\$12\.900/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Agregar al carrito/i })).toBeEnabled();
  });

  it("shows the WooCommerce discount label and sale price", () => {
    render(
      <FeedbackProvider>
        <CartProvider>
          <ProductCard
            product={{ ...product, price: 10_000, prices: { base: 10_000, list: 10_000, sale: 8_000 } }}
          />
        </CartProvider>
      </FeedbackProvider>,
    );

    expect(screen.getAllByText("20% OFF").length).toBeGreaterThan(0);
    expect(screen.getByText("Antes $10.000")).toBeInTheDocument();
    expect(screen.getByText("$8.000")).toBeInTheDocument();
  });
});
