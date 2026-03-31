export type ACFImage =
  | string
  | {
      url?: string;
    }
  | null;

export type HomeACF = {
  hero_banner?: ACFImage;
  hero_title?: string;
  hero_subtitle?: string;
  announcements?: { text?: string }[];
};

const HOME_SLUG = "inicio";

export async function getHomeContent(): Promise<HomeACF | null> {
  const base = process.env.WORDPRESS_URL;
  if (!base) return null;

  try {
    const res = await fetch(
      `${base.replace(/\/$/, "")}/wp-json/wp/v2/pages?slug=${HOME_SLUG}&_fields=acf`,
      { next: { revalidate: 60 } }
    );

    if (!res.ok) return null;
    const pages = (await res.json()) as { acf?: HomeACF }[];
    return pages?.[0]?.acf ?? null;
  } catch {
    return null;
  }
}
