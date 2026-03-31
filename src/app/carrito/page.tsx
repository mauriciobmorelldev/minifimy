import type { Metadata } from "next";
import CartClient from "./CartClient";

export const metadata: Metadata = {
  title: "Carrito",
  description: "Revisa los productos seleccionados antes de pagar.",
};

export default function CartPage() {
  return <CartClient />;
}
