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
    expect(screen.getByText("Algodón orgánico.")).toBeInTheDocument();
    expect(screen.getByText(/AR\$/)).toBeInTheDocument();
  });
});
