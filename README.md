# MINIFIMY Storefront

Tienda online de MINIFIMY construida con Next.js App Router, TypeScript y Tailwind CSS. El frontend vive separado del backend: WordPress + WooCommerce administran contenido, productos, categorias, precios, stock e imagenes.

## Comandos

```bash
npm run dev
npm run lint
npm run test
npm run build
```

## Backend configurable

La app usa datos locales como fallback, pero en produccion debe leer:

- WordPress REST API para contenido editable de la home via ACF.
- WooCommerce REST API para productos, categorias, precios, stock, imagenes y atributos.
- Next.js Data Cache con `revalidate` y tags para no consultar WordPress/WooCommerce en cada request.

## Variables de entorno

Crea `.env.local` para desarrollo y las mismas variables en el proveedor de deploy:

```bash
NEXT_PUBLIC_SITE_URL=https://minifimy.com
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXTAUTH_SECRET=tu_secreto
STRIPE_SECRET_KEY=sk_test_xxx

WORDPRESS_URL=https://backend.minifimy.com
WORDPRESS_HOME_SLUG=inicio
WORDPRESS_HOME_REVALIDATE_SECONDS=300

WOOCOMMERCE_URL=https://backend.minifimy.com
WOOCOMMERCE_CONSUMER_KEY=ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
WOOCOMMERCE_CONSUMER_SECRET=cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
WOOCOMMERCE_PRODUCTS_REVALIDATE_SECONDS=300
WOOCOMMERCE_CATEGORIES_REVALIDATE_SECONDS=900

REVALIDATE_SECRET=un_token_largo_y_privado
```

## Campos editables de home

Crear una pagina en WordPress con slug `inicio` y campos ACF con estos nombres:

- `hero_kicker`, `hero_title`, `hero_subtitle`
- `hero_primary_label`, `hero_primary_href`, `hero_secondary_label`, `hero_secondary_href`
- `hero_featured_product_slug`, `hero_companion_product_slug`
- `fimi_note_title`, `fimi_note_text`, `hero_gift_chip`
- `guide_title`, `guide_intro`
- `editorial_kicker`, `editorial_title`, `editorial_notes` (repeater con `text`)
- `featured_section_kicker`, `featured_section_title`
- `trust_kicker`, `trust_title`, `trust_items` (repeater con `icon`, `title`)
- `newsletter_title`, `newsletter_text`

Si algun campo falta, la app usa el fallback definido en `src/lib/wordpress.ts`.

## Cache y revalidacion

La app cachea fetches con tags:

- `home-content`
- `woo-products`
- `woo-categories`

Para refrescar manualmente o desde webhook:

```bash
curl -X POST https://minifimy.com/api/revalidate \
  -H "Content-Type: application/json" \
  -H "x-revalidate-secret: $REVALIDATE_SECRET" \
  -d '{"tags":["home-content","woo-products","woo-categories"]}'
```

Recomendacion de webhooks:

- Al guardar pagina `inicio`: revalidar `home-content`.
- Al crear/editar producto: revalidar `woo-products`.
- Al crear/editar categoria: revalidar `woo-categories`.

## Deploy recomendado

1. Crear WordPress + WooCommerce en Hostinger, idealmente en `backend.minifimy.com`.
2. Crear productos, categorias, imagenes y atributos en WooCommerce.
3. Crear API keys en WooCommerce: `WooCommerce > Settings > Advanced > REST API`.
4. Crear pagina `inicio` con ACF y cargar textos/slugs editables.
5. Deployar esta app Next.js en Vercel o un hosting Node compatible.
6. Configurar las variables de entorno del deploy.
7. Apuntar `minifimy.com` al frontend y `backend.minifimy.com` al WordPress.
8. Configurar webhooks o plugin para llamar `/api/revalidate` cuando cambien productos/contenido.

## Estructura principal

- `src/app/` rutas App Router.
- `src/components/` componentes reutilizables.
- `src/lib/wordpress.ts` contenido editable de WordPress/ACF.
- `src/lib/woocommerce.ts` productos y categorias desde WooCommerce.
- `src/lib/cache.ts` tags y tiempos de cache.
- `src/models/` interfaces TypeScript.
- `public/brand/` logo, banners e ilustraciones de marca.