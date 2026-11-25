import type { Metadata } from "next";
import { blackFridayPreview } from "@/lib/black-friday";
import CheckoutClient from "./CheckoutClient";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Checkout",
  description: "Completa tu compra de manera segura.",
};

export default function CheckoutPage() {
  const previewOnly = blackFridayPreview && !process.env.WOOCOMMERCE_URL && !process.env.WORDPRESS_URL;
  return <CheckoutClient previewOnly={previewOnly} />;
}
