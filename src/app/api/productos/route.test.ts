/** @jest-environment node */
import { NextRequest } from "next/server";
import { GET } from "@/app/api/productos/route";
import { getStoreProducts } from "@/lib/woocommerce";

jest.mock("@/lib/woocommerce", () => ({ getStoreProducts: jest.fn() }));

it("searches the Woo catalog before applying suggestion limits instead of scanning its first page", async () => {
  jest.mocked(getStoreProducts).mockResolvedValue([
    { id: "501", name: "Body Pima", slug: "body-pima", description: "Body", category: "bodies", stock: 2, price: 1000, images: [] },
  ]);
  const response = await GET(new NextRequest("https://minifimy.com/api/productos?q=bod&suggestions=1&limit=4"));
  expect(getStoreProducts).toHaveBeenCalledWith({ perPage: 100, search: "bod" });
  expect(await response.json()).toMatchObject({ products: [{ id: "501", slug: "body-pima" }] });
});
