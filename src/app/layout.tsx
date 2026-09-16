import type { Metadata } from "next";
import { Be_Vietnam_Pro, Plus_Jakarta_Sans } from "next/font/google";
import { Analytics } from "@/components/Analytics";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SiteLockedScreen } from "@/components/SiteLockedScreen";
import { WhatsAppFimy } from "@/components/WhatsAppFimy";
import { CartProvider } from "@/context/cart-context";
import { FeedbackProvider } from "@/context/feedback-context";
import { buildStoreMenu } from "@/lib/category-menu";
import { getStoreCategories } from "@/lib/woocommerce";
import { getSiteSettings } from "@/lib/wordpress";
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
    default: "MiniFimy | Ropa para bebés",
    template: "%s | MiniFimy",
  },
  description:
    "Ropita suave, cómoda y con mucho amor. Descubrí colecciones para bebés en MiniFimy.",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [{ url: "/icon", type: "image/png", sizes: "256x256" }],
    apple: [{ url: "/icon", type: "image/png", sizes: "256x256" }],
  },
  openGraph: {
    title: "MiniFimy | Ropa para bebés",
    description:
      "Ropita suave, cómoda y con mucho amor. Descubrí colecciones para bebés en MiniFimy.",
    url: "/",
    siteName: "MiniFimy",
    type: "website",
    locale: "es_AR",
  },
  twitter: {
    card: "summary_large_image",
    title: "MiniFimy | Ropa para bebés",
    description:
      "Ropita suave, cómoda y con mucho amor. Descubrí colecciones para bebés en MiniFimy.",
  },
};

function isHiddenCatalogMenuItem(href: string) {
  try {
    const url = new URL(href, "https://minifimy.com");
    return url.pathname.replace(/\/$/, "") === "/catalogo/sin-categorizar";
  } catch {
    return false;
  }
}

const siteLocked =
  process.env.NEXT_PUBLIC_SITE_LOCKED === "true" ||
  (process.env.NODE_ENV === "production" &&
    process.env.NEXT_PUBLIC_SITE_LOCKED !== "false");

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [siteSettings, storeCategories] = await Promise.all([getSiteSettings(), getStoreCategories()]);
  const mainMenu = buildStoreMenu(storeCategories);

  if (siteLocked) {
    return (
      <html lang="es" className={`${beVietnam.variable} ${plusJakarta.variable}`}>
        <body className="min-h-screen bg-background font-body text-on-surface antialiased selection:bg-primary-container selection:text-on-primary-container">
          <SiteLockedScreen />
          <Analytics />
        </body>
      </html>
    );
  }

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
            <Header navLinks={mainMenu} />
            <div id="main-content">{children}</div>
            <Footer
              exploreLinks={siteSettings.footerExploreMenu.filter((item) => !isHiddenCatalogMenuItem(item.href))}
              supportLinks={siteSettings.footerSupportMenu.filter((item) => !isHiddenCatalogMenuItem(item.href))}
            />
            <WhatsAppFimy phone={siteSettings.whatsappPhone} message={siteSettings.whatsappMessage} messages={siteSettings.whatsappMessages} />
          </CartProvider>
        </FeedbackProvider>
        <Analytics />
      </body>
    </html>
  );
}
