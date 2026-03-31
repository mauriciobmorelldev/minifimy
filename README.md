# MINIFIMY Storefront

Tienda online de MINIFIMY (ropa para bebés) construida con Next.js App Router,
TypeScript y Tailwind CSS.

## Comandos

```bash
npm run dev
npm run lint
npm run test
npm run cypress:open
```

## Variables de entorno

Crea un archivo `.env.local` con:

```
NEXT_PUBLIC_SITE_URL=https://minifimy.com
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
STRIPE_SECRET_KEY=sk_test_xxx
NEXTAUTH_SECRET=tu_secreto
```

## Estructura principal

- `src/app/` rutas App Router (home, catálogo, producto, carrito, checkout, cuenta, admin)
- `src/components/` componentes reutilizables (Header, Footer, ProductCard, etc.)
- `src/context/` contexto global de carrito
- `src/lib/` utilidades y mocks de productos
- `src/models/` interfaces TypeScript
- `public/brand/` logo, banners e ilustraciones de marca

## SEO

- Metadata por página en App Router.
- `src/app/sitemap.ts` y `src/app/robots.ts`.

## CI/CD

- GitHub Actions: `.github/workflows/ci.yml` corre `lint`, `test` y `build`.
- Deploy recomendado: Vercel (conecta el repo y define las variables de entorno).

## Tests

- Unitarios: Jest + Testing Library (`npm run test`).
- E2E: Cypress (`npm run cypress:open`).
