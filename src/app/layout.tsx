import type { Metadata } from "next";
import { Be_Vietnam_Pro, Plus_Jakarta_Sans } from "next/font/google";
import { Analytics } from "@/components/Analytics";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { WhatsAppFimy } from "@/components/WhatsAppFimy";
import { CartProvider } from "@/context/cart-context";
import { FeedbackProvider } from "@/context/feedback-context";
import "./globals.css";

const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://minifimy.com"),
  title: {
    default: "MINIFIMY | Ropa para bebés",
    template: "%s | MINIFIMY",
  },
  description:
    "Ropita suave, cómoda y con mucho amor. Descubrí colecciones para bebés en MINIFIMY.",
  openGraph: {
    title: "MINIFIMY | Ropa para bebés",
    description:
      "Ropita suave, cómoda y con mucho amor. Descubrí colecciones para bebés en MINIFIMY.",
    type: "website",
    locale: "es_AR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${beVietnam.variable} ${plusJakarta.variable}`}>
      <body className="min-h-screen bg-background font-body text-on-surface antialiased selection:bg-primary-container selection:text-on-primary-container">
        <FeedbackProvider>
          <CartProvider>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:left-6 focus:top-6 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm"
            >
              Saltar al contenido
            </a>
            <Header />
            <div id="main-content">{children}</div>
            <Footer />
            <WhatsAppFimy />
          </CartProvider>
        </FeedbackProvider>
        <Analytics />
      </body>
    </html>
  );
}
