/** @jest-environment node */

import { GET } from "./route";
import { getStoreProductsForMetaFeed } from "@/lib/woocommerce";

jest.mock("@/lib/woocommerce", () => ({ getStoreProductsForMetaFeed: jest.fn() }));

const product = {
  id: "428",
  title: 'Body "Nube", bebé',
  description: "Algodón suave",
  slug: "body-nube",
  price: 13750.5,
  image: "https://images.example/body.jpg",
  stock: 2,
  inStock: true,
  brand: "MiniFimy",
};

it("exports UTF-8, ARS, actual stock and the storefront product URL", async () => {
  jest.mocked(getStoreProductsForMetaFeed).mockResolvedValue([
    product,
    { ...product, id: "429", inStock: false, stock: 0 },
    { ...product, id: "430", stock: undefined },
    { ...product, id: "431", price: 0 },
  ]);
  const response = await GET();
  expect(response.headers.get("Content-Type")).toBe("text/csv; charset=utf-8");
  const [headers, available, soldOut, unknown, end] = (await response.text()).split("\r\n");
  expect(headers).toContain("availability,inventory");
  expect(available).toBe('"428","Body ""Nube"", bebé","Algodón suave","in stock","2","new","13750.50 ARS","https://minifimy.com/producto/body-nube","https://images.example/body.jpg","MiniFimy"');
  expect(soldOut).toContain('"out of stock","0"');
  expect(unknown).toContain('"in stock",""');
  expect(end).toBe("");
});

it("returns a retryable error when WooCommerce is unavailable", async () => {
  jest.mocked(getStoreProductsForMetaFeed).mockRejectedValue(new Error("Woo unavailable"));
  const response = await GET();
  expect(response.status).toBe(503);
  expect(response.headers.get("Cache-Control")).toBe("no-store");
});
