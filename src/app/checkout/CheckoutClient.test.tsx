import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CheckoutClient from "@/app/checkout/CheckoutClient";
import { useCart } from "@/context/cart-context";
import { COORDINATED_SHIPPING_METHODS } from "@/lib/checkout-options";

jest.mock("@/context/cart-context", () => ({
  useCart: jest.fn(),
  getWooStoreRequestHeaders: jest.fn(() => new Headers()),
}));

jest.mock("@/lib/meta-events", () => ({
  getMetaCartData: jest.fn(() => ({})),
  trackMetaEvent: jest.fn(),
}));

const paymentMethods = [
  { id: "woo-mercado-pago-basic", title: "Mercado Pago", description: "" },
  { id: "woo-mercado-pago-custom", title: "Tarjetas", description: "" },
  { id: "cod", title: "Efectivo/transferencia", description: "" },
  { id: "woo-mercado-pago-credits", title: "Pagos sin Tarjeta de Mercado Pago", description: "" },
];

const cartItem = {
  id: "cart-1",
  quantity: 1,
  selection: { size: "3 meses", color: "Crudo" },
  product: {
    id: "42",
    name: "Body MiniFimy",
    slug: "body-minifimy",
    description: "",
    price: 24_010,
    prices: {
      base: 24_010,
      list: 34_300,
      discount: 24_010,
      discountGatewayIds: ["cod"],
    },
    images: ["/brand/illustrations/jirafa.svg"],
    category: "Bodys",
    stock: 5,
  },
};

describe("CheckoutClient", () => {
  beforeEach(() => {
    jest.mocked(useCart).mockReturnValue({
      items: [cartItem],
      total: 24_010,
      loading: false,
      addToCart: jest.fn(),
      removeFromCart: jest.fn(),
      updateQuantity: jest.fn(),
      clearCart: jest.fn(),
      refreshCart: jest.fn().mockResolvedValue([cartItem]),
    });
    global.fetch = jest.fn().mockResolvedValue({
      json: async () => ({ paymentMethods, shippingMethods: COORDINATED_SHIPPING_METHODS }),
    }) as unknown as typeof fetch;
  });

  it("shows coordinated shipping and updates the total immediately for transfer", async () => {
    const user = userEvent.setup();
    const { container } = render(<CheckoutClient />);

    expect(await screen.findByRole("radio", { name: /Mercado Pago Pagá con los medios disponibles/i })).not.toBeChecked();
    expect(screen.getByRole("radio", { name: /Correo Argentino — retiro en sucursal/i })).not.toBeChecked();
    expect(screen.getByRole("link", { name: /Consultar costo de envío/i })).toHaveAttribute(
      "href",
      expect.stringContaining("wa.me"),
    );
    expect(screen.getByRole("link", { name: "Ver Body MiniFimy" })).toHaveAttribute(
      "href",
      "/producto/body-minifimy",
    );
    expect(screen.getByRole("link", { name: "Body MiniFimy" })).toHaveAttribute(
      "href",
      "/producto/body-minifimy",
    );
    expect(screen.getAllByText("AR$ 34.300")).toHaveLength(3);
    expect(screen.getByText("A coordinar")).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/gratis|950/i);

    await user.click(screen.getByRole("radio", { name: /Correo Argentino — retiro en sucursal/i }));
    await user.click(screen.getByRole("radio", { name: /Transferencia bancaria — 30% OFF/i }));

    await waitFor(() => {
      expect(screen.getByText("30% descuento por transferencia")).toBeInTheDocument();
      expect(screen.getByText("− AR$ 10.290")).toBeInTheDocument();
      expect(screen.getAllByText("AR$ 24.010")).toHaveLength(2);
    });
  });
});
