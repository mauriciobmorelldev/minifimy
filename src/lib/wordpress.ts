import { CACHE_SECONDS, CACHE_TAGS, normalizeBaseUrl } from "@/lib/cache";

export type ACFImage =
  | string
  | {
      url?: string;
    }
  | null;

type SlugListField = string | { slug?: string; product_slug?: string }[] | undefined;

export type HomeACF = {
  hero_kicker?: string;
  hero_title?: string;
  hero_subtitle?: string;
  hero_primary_label?: string;
  hero_primary_href?: string;
  hero_secondary_label?: string;
  hero_secondary_href?: string;
  hero_featured_product_slug?: string;
  hero_companion_product_slug?: string;
  fimi_newborn_product_slugs?: SlugListField;
  fimi_baby_shower_product_slugs?: SlugListField;
  fimi_cozy_product_slugs?: SlugListField;
  fimi_surprise_product_slugs?: SlugListField;
  editorial_product_slugs?: SlugListField;
  featured_product_slugs?: SlugListField;
  fimi_note_title?: string;
  fimi_note_text?: string;
  hero_gift_chip?: string;
  guide_title?: string;
  guide_intro?: string;
  editorial_kicker?: string;
  editorial_title?: string;
  editorial_notes?: { text?: string }[];
  featured_section_kicker?: string;
  featured_section_title?: string;
  trust_kicker?: string;
  trust_title?: string;
  trust_items?: { icon?: string; title?: string }[];
  newsletter_title?: string;
  newsletter_text?: string;
  hero_banner?: ACFImage;
  announcements?: { text?: string }[];
  main_menu?: { label?: string; href?: string }[];
  featured_menu_items?: { label?: string; href?: string }[];
  footer_explore_menu?: { label?: string; href?: string }[];
  footer_support_menu?: { label?: string; href?: string }[];
  whatsapp_phone?: string;
  whatsapp_message?: string;
  whatsapp_messages?: { text?: string }[];
};

export type HomeContent = {
  heroKicker: string;
  heroTitle: string;
  heroSubtitle: string;
  heroPrimaryLabel: string;
  heroPrimaryHref: string;
  heroSecondaryLabel: string;
  heroSecondaryHref: string;
  heroFeaturedProductSlug?: string;
  heroCompanionProductSlug?: string;
  guideProductSlugs: Record<string, string[]>;
  editorialProductSlugs: string[];
  featuredProductSlugs: string[];
  fimiNoteTitle: string;
  fimiNoteText: string;
  heroGiftChip: string;
  guideTitle: string;
  guideIntro: string;
  editorialKicker: string;
  editorialTitle: string;
  editorialNotes: string[];
  featuredSectionKicker: string;
  featuredSectionTitle: string;
  trustKicker: string;
  trustTitle: string;
  trustItems: { icon: string; title: string }[];
  newsletterTitle: string;
  newsletterText: string;
};


export type MenuItem = {
  label: string;
  href: string;
};

export type SiteSettings = {
  mainMenu: MenuItem[];
  footerExploreMenu: MenuItem[];
  footerSupportMenu: MenuItem[];
  featuredMenuItems: MenuItem[];
  menusFromWordPress: boolean;
  whatsappPhone?: string;
  whatsappMessage: string;
  whatsappMessages: string[];
};

const HOME_SLUG = process.env.WORDPRESS_HOME_SLUG ?? "inicio";

export const fallbackHomeContent: HomeContent = {
  heroKicker: "MiniFimy, con amor",
  heroTitle: "Un regalo que empieza antes de abrir la caja.",
  heroSubtitle:
    "Fimy te acompaña a elegir prendas suaves para esas primeras veces que quedan guardadas en la familia.",
  heroPrimaryLabel: "Encontrar algo especial",
  heroPrimaryHref: "/catalogo",
  heroSecondaryLabel: "Es para recién nacido",
  heroSecondaryHref: "/catalogo/recien-nacido",
  guideProductSlugs: { newborn: [], "baby-shower": [], cozy: [], fimy: [] },
  editorialProductSlugs: [],
  featuredProductSlugs: [],
  fimiNoteTitle: "Fimy dice",
  fimiNoteText:
    "Si es un regalo, empezá por una pieza suave, fácil de combinar y lista para usar.",
  heroGiftChip: "Para baby shower, primeros dias o una visita con amor",
  guideTitle: "Contame para quién es y te muestro por dónde empezar.",
  guideIntro:
    "La idea no es llenar la pantalla de productos. Es encontrar una prenda que tenga sentido para ese momento.",
  editorialKicker: "Un ratito de pausa",
  editorialTitle: "Pequeñas cosas que hacen enorme la infancia.",
  editorialNotes: [
    "Las primeras veces merecen algo especial.",
    "Elegimos cada detalle como si fuera para nuestra familia.",
    "Fimy aparece poquito, solo cuando puede ayudar.",
  ],
  featuredSectionKicker: "Encontramos algo especial",
  featuredSectionTitle: "Una selección pequeña, pensada para elegir sin apuro.",
  trustKicker: "Gracias por pasar",
  trustTitle: "Una compra tranquila también es parte del regalo.",
  trustItems: [
    { icon: "eco", title: "Algodón suave" },
    { icon: "redeem", title: "Listo para regalar" },
    { icon: "local_shipping", title: "Envíos cuidados" },
    { icon: "favorite", title: "Curado con amor" },
  ],
  newsletterTitle: "Cartitas suaves de MiniFimy",
  newsletterText: "Novedades, regalos y pequeñas joyitas para mirar con tiempo.",
};


export const fallbackSiteSettings: SiteSettings = {
  mainMenu: [{ href: "/catalogo", label: "Catálogo" }],
  footerExploreMenu: [
    { href: "/catalogo", label: "Catálogo" },
    { href: "/envios-y-cambios", label: "Envíos y cambios" },
  ],
  footerSupportMenu: [
    { href: "/contacto", label: "Contacto" },
    { href: "/legales", label: "Políticas" },
  ],
  featuredMenuItems: [],
  menusFromWordPress: false,
  whatsappPhone: process.env.NEXT_PUBLIC_STORE_WHATSAPP_PHONE ?? "5493794004299",
  whatsappMessage: "¡Hola MiniFimy! Quiero hacer una consulta.",
  whatsappMessages: ["Hola, soy Fimy.", "Te ayudo a elegir?"],
};

function normalizeMenu(items: { label?: string; href?: string }[] | undefined) {
  const routeByLabel = [
    { terms: ["envio"], href: "/envios-y-cambios", label: "Envíos y cambios" },
    { terms: ["devolucion"], href: "/envios-y-cambios", label: "Envíos y cambios" },
    { terms: ["cambio"], href: "/envios-y-cambios", label: "Envíos y cambios" },
    { terms: ["politica"], href: "/legales", label: "Políticas" },
  ];

  return (items
    ?.map((item) => ({ label: item.label?.trim() ?? "", href: item.href?.trim() ?? "" }))
    .filter((item) => {
      if (!item.label || !item.href) return false;
      const normalizedLabel = item.label.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      return !(normalizedLabel.includes("guia") && normalizedLabel.includes("talle"));
    }) ?? [])
    .map((item) => {
      const label = item.label.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      const route = routeByLabel.find((candidate) => candidate.terms.some((term) => label.includes(term)));
      return route ? { ...item, href: route.href, label: route.label } : item;
    });
}

function normalizePhone(value?: string) {
  const phone = value?.replace(/[^0-9]/g, "");

  if (!phone) return undefined;
  if (phone.startsWith("54")) return phone;
  if (phone.length === 10 && phone.startsWith("3")) return `549${phone}`;

  return phone;
}

function normalizeSiteSettings(acf?: HomeACF | null): SiteSettings {
  const mainMenu = normalizeMenu(acf?.main_menu);
  const footerExploreMenu = normalizeMenu(acf?.footer_explore_menu);
  const footerSupportMenu = normalizeMenu(acf?.footer_support_menu);
  const featuredMenuItems = normalizeMenu(acf?.featured_menu_items);
  const menusFromWordPress = mainMenu.length > 0 || footerExploreMenu.length > 0 || footerSupportMenu.length > 0 || featuredMenuItems.length > 0;

  return {
    mainMenu: mainMenu.length > 0 ? mainMenu : fallbackSiteSettings.mainMenu,
    footerExploreMenu: footerExploreMenu.length > 0 ? footerExploreMenu : fallbackSiteSettings.footerExploreMenu,
    footerSupportMenu: footerSupportMenu.length > 0 ? footerSupportMenu : fallbackSiteSettings.footerSupportMenu,
    featuredMenuItems,
    menusFromWordPress,
    whatsappPhone: normalizePhone(acf?.whatsapp_phone) ?? normalizePhone(fallbackSiteSettings.whatsappPhone),
    whatsappMessage: firstText(acf?.whatsapp_message, fallbackSiteSettings.whatsappMessage),
    whatsappMessages:
      (acf?.whatsapp_messages?.map((item) => item.text).filter(Boolean) as string[] | undefined) ??
      fallbackSiteSettings.whatsappMessages,
  };
}

function normalizeSlugList(value: SlugListField): string[] {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value
      .map((item) => item.slug ?? item.product_slug ?? "")
      .map((slug) => slug.trim())
      .filter(Boolean);
  }

  return value
    .split(/[\n,]/)
    .map((slug) => slug.trim())
    .filter(Boolean);
}

function firstText(value: string | undefined, fallback: string) {
  return value?.trim() || fallback;
}

function normalizeHomeContent(acf?: HomeACF | null): HomeContent {
  if (!acf) return fallbackHomeContent;

  return {
    heroKicker: firstText(acf.hero_kicker, fallbackHomeContent.heroKicker),
    heroTitle: firstText(acf.hero_title, fallbackHomeContent.heroTitle),
    heroSubtitle: firstText(acf.hero_subtitle, fallbackHomeContent.heroSubtitle),
    heroPrimaryLabel: firstText(acf.hero_primary_label, fallbackHomeContent.heroPrimaryLabel),
    heroPrimaryHref: firstText(acf.hero_primary_href, fallbackHomeContent.heroPrimaryHref),
    heroSecondaryLabel: firstText(acf.hero_secondary_label, fallbackHomeContent.heroSecondaryLabel),
    heroSecondaryHref: firstText(acf.hero_secondary_href, fallbackHomeContent.heroSecondaryHref),
    heroFeaturedProductSlug: acf.hero_featured_product_slug,
    heroCompanionProductSlug: acf.hero_companion_product_slug,
    guideProductSlugs: {
      newborn: normalizeSlugList(acf.fimi_newborn_product_slugs),
      "baby-shower": normalizeSlugList(acf.fimi_baby_shower_product_slugs),
      cozy: normalizeSlugList(acf.fimi_cozy_product_slugs),
      fimy: normalizeSlugList(acf.fimi_surprise_product_slugs),
    },
    editorialProductSlugs: normalizeSlugList(acf.editorial_product_slugs),
    featuredProductSlugs: normalizeSlugList(acf.featured_product_slugs),
    fimiNoteTitle: firstText(acf.fimi_note_title, fallbackHomeContent.fimiNoteTitle),
    fimiNoteText: firstText(acf.fimi_note_text, fallbackHomeContent.fimiNoteText),
    heroGiftChip: firstText(acf.hero_gift_chip, fallbackHomeContent.heroGiftChip),
    guideTitle: firstText(acf.guide_title, fallbackHomeContent.guideTitle),
    guideIntro: firstText(acf.guide_intro, fallbackHomeContent.guideIntro),
    editorialKicker: firstText(acf.editorial_kicker, fallbackHomeContent.editorialKicker),
    editorialTitle: firstText(acf.editorial_title, fallbackHomeContent.editorialTitle),
    editorialNotes:
      ((acf.editorial_notes?.map((item) => item.text).filter(Boolean) as string[] | undefined) ??
        fallbackHomeContent.editorialNotes),
    featuredSectionKicker: firstText(
      acf.featured_section_kicker,
      fallbackHomeContent.featuredSectionKicker
    ),
    featuredSectionTitle: firstText(
      acf.featured_section_title,
      fallbackHomeContent.featuredSectionTitle
    ),
    trustKicker: firstText(acf.trust_kicker, fallbackHomeContent.trustKicker),
    trustTitle: firstText(acf.trust_title, fallbackHomeContent.trustTitle),
    trustItems:
      acf.trust_items
        ?.map((item) => ({ icon: item.icon || "favorite", title: item.title || "MiniFimy" }))
        .filter((item) => item.title) ?? fallbackHomeContent.trustItems,
    newsletterTitle: firstText(acf.newsletter_title, fallbackHomeContent.newsletterTitle),
    newsletterText: firstText(acf.newsletter_text, fallbackHomeContent.newsletterText),
  };
}

export async function getHomeContent(): Promise<HomeContent> {
  const base = normalizeBaseUrl(process.env.WORDPRESS_URL);
  if (!base) return fallbackHomeContent;

  try {
    const res = await fetch(`${base}/wp-json/wp/v2/pages?slug=${HOME_SLUG}&_fields=acf`, {
      next: { revalidate: CACHE_SECONDS.home, tags: [CACHE_TAGS.home] },
    });

    if (!res.ok) return fallbackHomeContent;
    const pages = (await res.json()) as { acf?: HomeACF }[];
    return normalizeHomeContent(pages?.[0]?.acf);
  } catch {
    return fallbackHomeContent;
  }
}
export async function getSiteSettings(): Promise<SiteSettings> {
  const base = normalizeBaseUrl(process.env.WORDPRESS_URL);
  if (!base) return fallbackSiteSettings;

  try {
    const res = await fetch(`${base}/wp-json/wp/v2/pages?slug=${HOME_SLUG}&_fields=acf`, {
      next: { revalidate: CACHE_SECONDS.home, tags: [CACHE_TAGS.home] },
    });

    if (!res.ok) return fallbackSiteSettings;
    const pages = (await res.json()) as { acf?: HomeACF }[];
    return normalizeSiteSettings(pages?.[0]?.acf);
  } catch {
    return fallbackSiteSettings;
  }
}
