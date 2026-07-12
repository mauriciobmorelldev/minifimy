import type { Metadata } from "next";
import { Be_Vietnam_Pro, Plus_Jakarta_Sans } from "next/font/google";
import { Analytics } from "@/components/Analytics";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MinifimyIntroLoader } from "@/components/MinifimyIntroLoader";
import { SiteLockedScreen } from "@/components/SiteLockedScreen";
import { WhatsAppFimy } from "@/components/WhatsAppFimy";
import { CartProvider } from "@/context/cart-context";
import { FeedbackProvider } from "@/context/feedback-context";
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
    default: "MINIFIMY | Ropa para bebÃ©s",
    template: "%s | MINIFIMY",
  },
  description:
    "Ropita suave, cÃ³moda y con mucho amor. DescubrÃ­ colecciones para bebÃ©s en MINIFIMY.",
  openGraph: {
    title: "MINIFIMY | Ropa para bebÃ©s",
    description:
      "Ropita suave, cÃ³moda y con mucho amor. DescubrÃ­ colecciones para bebÃ©s en MINIFIMY.",
    type: "website",
    locale: "es_AR",
  },
};

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
  const catalogChildren = storeCategories.slice(0, 12).map((category) => ({
    href: `/catalogo/${category.slug}`,
    label: category.name,
  }));
  const automaticFeaturedMenu = storeCategories.slice(0, 3).map((category) => ({
    href: `/catalogo/${category.slug}`,
    label: category.name,
  }));
  const featuredMenu = siteSettings.featuredMenuItems.length > 0 ? siteSettings.featuredMenuItems.slice(0, 3) : automaticFeaturedMenu;
  const baseMenu = [
    { href: "/catalogo", label: "Catalogo", children: catalogChildren },
    ...featuredMenu,
  ];
  const extraMenu = siteSettings.menusFromWordPress
    ? siteSettings.mainMenu.filter((item) => !baseMenu.some((baseItem) => baseItem.href === item.href))
    : [];
  const mainMenu = [...baseMenu, ...extraMenu].slice(0, 6);

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
            <MinifimyIntroLoader />
            <Header navLinks={mainMenu} />
            <div id="main-content">{children}</div>
            <Footer exploreLinks={siteSettings.footerExploreMenu} supportLinks={siteSettings.footerSupportMenu} />
            <WhatsAppFimy phone={siteSettings.whatsappPhone} message={siteSettings.whatsappMessage} messages={siteSettings.whatsappMessages} />
          </CartProvider>
        </FeedbackProvider>
        <Analytics />
      </body>
    </html>
  );
}
