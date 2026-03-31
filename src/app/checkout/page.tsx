import type { Metadata } from "next";
import CheckoutClient from "./CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Completa tu compra de manera segura.",
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
