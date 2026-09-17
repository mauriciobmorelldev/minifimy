# Minifimy - Padres adicionales de categorías

Este plugin permite que una sola categoría de WooCommerce aparezca dentro de dos o más secciones principales del menú.

## Uso

1. Instalá y activá este plugin.
2. Entrá en **Productos > Categorías**.
3. Editá una subcategoría, por ejemplo **Partes de abajo**.
4. Conservá su **Categoría superior** habitual.
5. En **Secciones padre adicionales**, marcá las demás secciones donde debe aparecer, por ejemplo **Niños**.
6. Guardá la categoría.

La subcategoría no se duplica y los productos conservan sus categorías actuales.

## Trabajo junto a Público MiniFimy

Después, editá cada producto compartido y usá **Público MiniFimy**:

- **Niñas**: se muestra cuando se entra desde Niñas.
- **Niños**: se muestra cuando se entra desde Niños.
- Se pueden marcar ambos.
- Sin marcas, sigue funcionando la regla anterior basada en los talles.

El plugin expone `minifimy_parent_slugs` en la API de categorías de WooCommerce para que el menú web pueda construir la misma estructura en desktop y mobile.
