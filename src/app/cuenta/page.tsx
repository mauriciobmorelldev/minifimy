import type { Metadata } from "next";
import { AccountClient } from "@/components/AccountClient";

export const metadata: Metadata = {
  title: "Mi cuenta",
  description: "Cuenta, pedidos e inicio de sesión con Fimy desde el front de MiniFimy.",
};

export default function AccountPage() {
  return (
    <main className="mobile-soft-page relative mx-auto min-h-screen w-full max-w-6xl px-5 pb-20 pt-28 md:px-6">
      <AccountClient />
    </main>
  );
}
