/** @jest-environment node */

import { GET } from "./route";
import { getStoreProductsForMetaFeed } from "@/lib/woocommerce";
import { isBlackFridayActive } from "@/lib/black-friday-server";

jest.mock("@/lib/woocommerce", () => ({ getStoreProductsForMetaFeed: jest.fn() }));
jest.mock("@/lib/black-friday-server", () => ({
  ...jest.requireActual("@/lib/black-friday-server"),
  isBlackFridayActive: jest.fn().mockReturnValue(false),
}));

const product = {
  id: "428",
  title: 'Body "Nube", bebé',
  description: "Algodón suave",
  slug: "body-nube",
  price: 13750.5,
  discountPrice: undefined,
  image: "https://images.example/body.jpg",
  stock: 2,
  inStock: true,
  brand: "MiniFimy",
};

it("exports UTF-8, ARS, actual stock and the storefront product URL", async () => {
  jest.mocked(getStoreProductsForMetaFeed).mockResolvedValue([
    product,
    { ...product, id: "429", inStock: false, stock: 0, discountPrice: 9900 },
    { ...product, id: "430", stock: undefined },
    { ...product, id: "431", price: 1 },
  ]);
  const response = await GET();
  expect(response.headers.get("Content-Type")).toBe("text/csv; charset=utf-8");
  const [headers, available, soldOut, unknown, end] = (await response.text()).split("\r\n");
  expect(headers).toContain("availability,inventory");
  expect(available).toBe('"428","Body ""Nube"", bebé","Algodón suave","in stock","2","new","13750.50 ARS","https://minifimy.com/producto/body-nube","https://images.example/body.jpg","MiniFimy","",""');
  expect(soldOut).toContain('"out of stock","0"');
  expect(soldOut).toContain('Precio de oferta abonando por transferencia.');
  expect(soldOut).toContain('"9900.00 ARS",""');
  expect(unknown).toContain('"in stock",""');
  expect(end).toBe("");
});

it("uses the Black Friday amount and gives Meta a scheduled end date", async () => {
  jest.mocked(isBlackFridayActive).mockReturnValueOnce(true);
  jest.mocked(getStoreProductsForMetaFeed).mockResolvedValue([{ ...product, discountPrice: 9900 }]);
  const response = await GET();
  const [header, row] = (await response.text()).split("\r\n");
  expect(getStoreProductsForMetaFeed).toHaveBeenLastCalledWith("black-friday");
  expect(header).toContain("sale_price,sale_price_effective_date");
  expect(row).toContain('"6875.25 ARS","2026-11-26T03:00+0000/2026-11-30T03:00+0000"');
});

it("returns a retryable error when WooCommerce is unavailable", async () => {
  jest.mocked(getStoreProductsForMetaFeed).mockRejectedValue(new Error("Woo unavailable"));
  const response = await GET();
  expect(response.status).toBe(503);
  expect(response.headers.get("Cache-Control")).toBe("no-store");
});
