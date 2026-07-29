import { render, screen } from "@testing-library/react";
import { ProductReviews } from "@/components/ProductReviews";

describe("ProductReviews", () => {
  it("does not emphasize an empty reviews state", () => {
    const { container } = render(<ProductReviews productSlug="body-nube" initialReviews={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows real published reviews", () => {
    render(
      <ProductReviews
        productSlug="body-nube"
        initialReviews={[{
          id: "1",
          reviewer: "Ana",
          review: "Muy suave.",
          rating: 5,
          verified: true,
        }]}
      />,
    );
    expect(screen.getByText(/Muy suave/)).toBeInTheDocument();
    expect(screen.getByText("Compra verificada")).toBeInTheDocument();
  });
});
