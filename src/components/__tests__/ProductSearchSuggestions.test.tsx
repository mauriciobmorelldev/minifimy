import { render, screen } from "@testing-library/react";
import { ProductSearchSuggestions } from "@/components/ProductSearchSuggestions";

const suggestion = {
  id: "42",
  name: "Body Nube Orgánico",
  slug: "body-nube-organico",
  image: "/brand/banners/banner-foto.jpg",
  category: "recien-nacido",
  price: 27_900,
  prices: { base: 27_900, list: 27_900 },
};

describe("ProductSearchSuggestions", () => {
  it("shows useful product details in recommendations", () => {
    const { container } = render(
      <ProductSearchSuggestions suggestions={[suggestion]} query="" />,
    );

    expect(screen.getByText("Recomendados MiniFimy")).toBeInTheDocument();
    expect(screen.getByText("Recién nacido")).toBeInTheDocument();
    expect(screen.getByText("Body Nube Orgánico")).toBeInTheDocument();
    expect(screen.getByText("$27.900")).toBeInTheDocument();
    expect(screen.getByText("3 cuotas sin interés · $9.300")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver Body Nube Orgánico" })).toHaveAttribute(
      "href",
      "/producto/body-nube-organico",
    );
    expect(container.querySelector("img")).toHaveAttribute("sizes", "64px");
    expect(container.querySelector("img")).toHaveAttribute("loading", "lazy");
  });

  it("changes the heading when the customer types three letters", () => {
    render(
      <ProductSearchSuggestions suggestions={[suggestion]} query="bod" />,
    );

    expect(screen.getByText("Coincidencias para tu búsqueda")).toBeInTheDocument();
  });
});
