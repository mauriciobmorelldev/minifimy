import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Header } from "@/components/Header";
import { useCart } from "@/context/cart-context";
import { useProductSuggestions } from "@/hooks/use-product-suggestions";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@/components/MiniCartDrawer", () => ({
  MiniCartDrawer: () => null,
}));

jest.mock("@/context/cart-context", () => ({
  useCart: jest.fn(),
}));

jest.mock("@/hooks/use-product-suggestions", () => ({
  useProductSuggestions: jest.fn(() => []),
}));

describe("Header search", () => {
  beforeEach(() => {
    mockPush.mockClear();
    jest.mocked(useProductSuggestions).mockReturnValue([]);
    jest.mocked(useCart).mockReturnValue({
      items: [],
      total: 0,
      loading: false,
      addToCart: jest.fn(),
      removeFromCart: jest.fn(),
      updateQuantity: jest.fn(),
      clearCart: jest.fn(),
      refreshCart: jest.fn(),
    });
  });

  it("activates suggestions in the desktop field and only navigates when submitted", async () => {
    const user = userEvent.setup();
    render(<Header navLinks={[]} />);
    const input = screen.getByRole("textbox", { name: "Buscar productos desde el encabezado" });
    await user.type(input, "bod");
    expect(useProductSuggestions).toHaveBeenLastCalledWith("bod", true, true);
    expect(mockPush).not.toHaveBeenCalled();
    await user.keyboard("{Enter}");
    expect(mockPush).toHaveBeenCalledWith("/catalogo?q=bod");
  });

  it("shows desktop suggestion links without submitting the search form", async () => {
    jest.mocked(useProductSuggestions).mockImplementation((query, enabled) => enabled && query.length >= 3 ? [
      { id: "1", name: "Body Pima", slug: "body-pima", image: "/body.png", category: "bodies", price: 1000 },
    ] : []);
    const user = userEvent.setup();
    render(<Header navLinks={[]} />);
    await user.type(screen.getByRole("textbox", { name: "Buscar productos desde el encabezado" }), "bod");
    expect(screen.getAllByRole("link", { name: "Ver Body Pima" })[0]).toHaveAttribute("href", "/producto/body-pima");
    expect(mockPush).not.toHaveBeenCalled();
    await user.keyboard("{Escape}");
    expect(useProductSuggestions).toHaveBeenLastCalledWith("bod", false, true);
  });

  it("focuses the input on the first and subsequent magnifying-glass clicks", async () => {
    const user = userEvent.setup();
    render(<Header navLinks={[]} />);

    const searchButton = screen.getAllByRole("button", { name: "Buscar" })[0];
    await user.click(searchButton);
    await waitFor(() => expect(screen.getByRole("textbox", { name: "Buscar productos" })).toHaveFocus());

    screen.getByRole("textbox", { name: "Buscar productos" }).blur();
    await user.click(searchButton);
    expect(screen.getByRole("textbox", { name: "Buscar productos" })).toHaveFocus();
  });

  it("closes when the customer clicks outside the search panel", async () => {
    const user = userEvent.setup();
    render(<Header navLinks={[]} />);

    const searchButton = screen.getAllByRole("button", { name: "Buscar" })[0];
    await user.click(searchButton);
    await waitFor(() => expect(searchButton).toHaveAttribute("aria-expanded", "true"));

    await user.click(document.body);
    expect(searchButton).toHaveAttribute("aria-expanded", "false");
  });
  it("opens mobile categories separately and closes after choosing a subcategory", async () => {
    const user = userEvent.setup();
    render(<Header navLinks={[
      { href: "/catalogo", label: "Catálogo", children: [{ href: "/catalogo/tejidos", label: "Tejidos" }] },
      { href: "/catalogo/bebes", label: "Bebés", children: [{ href: "/catalogo/bodies", label: "Bodies" }] },
      { href: "/catalogo/ninas", label: "Niñas", children: [{ href: "/catalogo/vestidos", label: "Vestidos" }] },
    ]} />);
    await user.click(screen.getByRole("button", { name: "Abrir menú" }));
    const catalog = screen.getByRole("button", { name: /Catálogo/ });
    const babies = screen.getByRole("button", { name: /Bebés/ });
    const girls = screen.getByRole("button", { name: /Niñas/ });
    await user.click(catalog);
    await user.click(babies);
    expect(catalog).toHaveAttribute("aria-expanded", "false");
    expect(babies).toHaveAttribute("aria-expanded", "true");
    expect(girls).toHaveAttribute("aria-expanded", "false");
    await user.click(girls);
    expect(babies).toHaveAttribute("aria-expanded", "false");
    expect(girls).toHaveAttribute("aria-expanded", "true");
    await user.click(screen.getAllByRole("link", { name: "Vestidos" }).at(-1)!);
    expect(screen.getByRole("button", { name: "Abrir menú" })).toHaveAttribute("aria-expanded", "false");
    expect(girls).toHaveAttribute("aria-expanded", "false");
  });

});
