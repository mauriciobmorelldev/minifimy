# MiniFimy en Google Search Console

## Alta de la propiedad

1. Entrar con la cuenta de Google que será propietaria en https://search.google.com/search-console.
2. Agregar la propiedad de **Dominio** `minifimy.com` (sin `https://` ni `www`).
3. Copiar el valor TXT exacto que entrega Google, con formato `google-site-verification=...`.
4. Agregar **un nuevo** registro TXT en el DNS del dominio, en la raíz (`@` o campo de nombre vacío, según el proveedor). Conservar todos los TXT existentes.
5. Volver a Search Console y pulsar **Verificar**. Mantener ese TXT en DNS mientras la propiedad esté en uso.

La verificación de dominio es un cambio de DNS vinculado a la cuenta propietaria. El token se genera en Search Console; no debe inventarse ni guardarse en este repositorio.

## Después del despliegue

1. Comprobar que `https://minifimy.com/robots.txt` responde con `Sitemap: https://minifimy.com/sitemap.xml`.
2. Comprobar que `https://minifimy.com/sitemap.xml` incluye portada, catálogo, categorías y productos publicados, y excluye carrito, checkout y cuenta.
3. En **Sitemaps**, enviar `https://minifimy.com/sitemap.xml` y revisar el estado de lectura.
4. En **Inspección de URL**, comprobar la portada, una categoría y un producto real. Solicitar indexación si Google todavía no los descubrió.
5. Probar un producto publicado en https://search.google.com/test/rich-results y revisar que el precio y la disponibilidad coincidan con la página.
6. Seguir los informes de **Indexación de páginas** y **Resultados de productos**. Corregir errores reales a partir de las URLs afectadas.

El envío del sitemap facilita el descubrimiento; Google decide qué páginas indexar y cuándo. No hay que subir un archivo de verificación al proyecto cuando se usa la propiedad de dominio con TXT DNS.
