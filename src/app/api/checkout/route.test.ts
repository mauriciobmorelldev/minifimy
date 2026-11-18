/** @jest-environment node */

import { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/checkout/route";
import { COORDINATED_SHIPPING_METHODS } from "@/lib/checkout-options";
import { getStorePaymentMethods } from "@/lib/woocommerce";
import { proxyWooStoreRequest } from "@/lib/woo-store-api";

jest.mock("@/lib/woocommerce", () => ({ getStorePaymentMethods: jest.fn() }));
jest.mock("@/lib/woo-store-api", () => ({ proxyWooStoreRequest: jest.fn() }));

const methods = [
  "woo-mercado-pago-basic",
  "woo-mercado-pago-custom",
  "cod",
  "woo-mercado-pago-credits",
];

function checkoutRequest(paymentMethodId: string) {
  return new NextRequest("https://minifimy.example/api/checkout", {
    method: "POST",
    body: JSON.stringify({
      paymentMethodId,
      shippingMethodId: COORDINATED_SHIPPING_METHODS[0].id,
      customer: {
        name: "Cliente Prueba",
        email: "cliente@example.com",
        address: "Calle de prueba 123",
        city: "Corrientes",
        postalCode: "3400",
        phone: "3790000000",
      },
    }),
  });
}

beforeEach(() => jest.clearAllMocks());

it("offers Checkout Pro and keeps store credit and transfer available", async () => {
  jest.mocked(getStorePaymentMethods).mockResolvedValue(
    methods.map((id) => ({ id, title: id, description: "", enabled: true })),
  );

  const response = await GET();
  const { paymentMethods } = await response.json();
  expect(paymentMethods.map((method: { id: string }) => method.id)).toEqual([
    "woo-mercado-pago-basic",
    "cod",
    "woo-mercado-pago-credits",
  ]);
});

it("returns a recovery message for an old tab before contacting WooCommerce", async () => {
  const response = await POST(checkoutRequest("woo-mercado-pago-custom"));

  expect(response.status).toBe(422);
  expect(await response.json()).toEqual({ message: expect.stringContaining("Recargá") });
  expect(proxyWooStoreRequest).not.toHaveBeenCalled();
});

it.each(["woo-mercado-pago-basic", "woo-mercado-pago-credits", "cod"])(
  "forwards %s to WooCommerce without replacing the gateway",
  async (paymentMethodId) => {
    const request = checkoutRequest(paymentMethodId);
    await POST(request);

    expect(proxyWooStoreRequest).toHaveBeenCalledWith({
      path: "/checkout",
      method: "POST",
      request,
      body: expect.objectContaining({ payment_method: paymentMethodId }),
    });
  },
);
