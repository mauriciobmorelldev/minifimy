import {
  COORDINATED_SHIPPING_METHODS,
  getCartItemOptions,
  getCheckoutUnitPrice,
  getListSubtotal,
  getPaymentMethodCopy,
  sortPaymentMethods,
} from "@/lib/checkout-options";
import type { CartItem } from "@/models/product";

const cartItem: CartItem = {
  id: "cart-1",
  quantity: 2,
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
    images: [],
    category: "Bodys",
    stock: 5,
  },
};

describe("checkout pricing", () => {
  it("keeps list pricing until transfer is selected", () => {
    expect(getListSubtotal([cartItem])).toBe(68_600);
    expect(getCheckoutUnitPrice(cartItem, "")).toBe(34_300);
    expect(getCheckoutUnitPrice(cartItem, "woo-mercado-pago-basic")).toBe(34_300);
    expect(getCheckoutUnitPrice(cartItem, "cod")).toBe(24_010);
  });
});

describe("coordinated shipping", () => {
  it("exposes the three requested options without a fictitious amount or free label", () => {
    expect(COORDINATED_SHIPPING_METHODS.map((method) => method.title)).toEqual([
      "Correo Argentino — retiro en sucursal",
      "Correo Argentino — envío a domicilio",
      "Entrega en Corrientes Capital",
    ]);
    expect(COORDINATED_SHIPPING_METHODS.every((method) => method.total === 0)).toBe(true);
    expect(JSON.stringify(COORDINATED_SHIPPING_METHODS)).not.toMatch(/gratis|950/i);
  });
});

describe("payment presentation", () => {
  const methods = [
    { id: "woo-mercado-pago-credits", title: "Pagos sin Tarjeta de Mercado Pago", description: "" },
    { id: "cod", title: "Efectivo/transferencia", description: "" },
    { id: "woo-mercado-pago-custom", title: "Tarjetas", description: "" },
    { id: "woo-mercado-pago-basic", title: "Mercado Pago", description: "" },
  ];

  it("orders the main choices first and explains Mercado Pago credit clearly", () => {
    expect(sortPaymentMethods(methods).map((method) => method.id)).toEqual([
      "woo-mercado-pago-basic",
      "woo-mercado-pago-custom",
      "cod",
      "woo-mercado-pago-credits",
    ]);
    expect(getPaymentMethodCopy(methods[0])).toEqual({
      title: "Pagos sin Tarjeta de Mercado Pago",
      description: "Pagá en cuotas sin tarjeta usando tu línea de crédito disponible en Mercado Pago.",
    });
    expect(getPaymentMethodCopy(methods[1]).title).toBe("Transferencia bancaria — 30% OFF");
  });
});

describe("cart item options", () => {
  it("shows the only available size, color and model when Woo omits the selection", () => {
    const item = {
      ...cartItem,
      product: {
        ...cartItem.product,
        sizes: ["0–3 meses"],
        colors: ["Natural"],
        models: ["Clásico"],
      },
    };

    expect(getCartItemOptions(item)).toEqual({
      size: "0–3 meses",
      color: "Natural",
      model: "Clásico",
    });
  });

  it("does not guess an option when more than one is available", () => {
    const item = {
      ...cartItem,
      product: { ...cartItem.product, sizes: ["0–3 meses", "3–6 meses"] },
    };

    expect(getCartItemOptions(item).size).toBeUndefined();
  });
});
