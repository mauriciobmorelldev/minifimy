# Gate de campaña MiniFimy

Estado al 29 de julio de 2026: **NO-GO**

La implementación técnica está preparada, pero la campaña no debe activarse hasta completar y documentar los gates comerciales y operativos.

## 1. Información comercial

- [ ] Sofi/May aprobaron modalidades, empresas, origen, cobertura, costos, plazos y seguimiento de envíos.
- [ ] Se cargaron las variables `STORE_SHIPPING_*` y `STORE_SHIPPING_POLICY_APPROVED=true`.
- [ ] Sofi/May aprobaron plazo, condiciones, exclusiones y costos de cambios.
- [ ] Se cargaron las variables `STORE_EXCHANGE_*` y `STORE_EXCHANGE_POLICY_APPROVED=true`.
- [ ] Se midieron prendas reales y se aprobó la tabla de talles.
- [ ] Se cargaron las variables `STORE_SIZE_GUIDE_*` y `STORE_SIZE_GUIDE_APPROVED=true`.

Mientras estos puntos sigan pendientes, las páginas informativas muestran un aviso transparente y derivan a contacto; no prometen datos inventados.

## 2. Catálogo y anuncios

- [ ] “Camiseta Reggi Volados” tiene nombre, categoría, foto y descripción coherentes.
- [ ] “Babucha Bati frisada” dejó de estar categorizada como “Buzos”.
- [ ] Todos los productos incluidos en anuncios fueron revisados con la planilla.
- [ ] WooCommerce contiene talles, colores y categorías canónicos.
- [ ] Los precios de lista, transferencia y cuotas coinciden con WooCommerce.
- [ ] No se comunica un porcentaje global que no aplique a toda la tienda.

## 3. Compra móvil real

- [ ] Se realizó una orden real controlada desde un teléfono.
- [ ] Se probaron producto simple y producto con variantes.
- [ ] Se validaron talle, color, cantidades, falta de stock y carrito.
- [ ] Se verificaron campos, envío, medio de pago, descuentos y errores.
- [ ] La orden apareció correctamente en WooCommerce.
- [ ] Se recibieron las confirmaciones esperadas.
- [ ] La orden fue cancelada o reintegrada y se guardó evidencia.

## 4. Verificación técnica

- [x] Footer saneado para rutas de talles, envíos/cambios, contacto y políticas.
- [x] Productos sin stock continúan visibles y no comprables.
- [x] Colores duplicados se normalizan defensivamente.
- [x] Talles conocidos usan un orden comercial explícito.
- [x] Reseñas vacías no se destacan.
- [x] Home prioriza compra, accesos por necesidad y nuevos ingresos.
- [ ] Lint sin deuda preexistente.
- [x] Tests completos ejecutados.
- [x] Build de producción aprobado.
- [ ] QA visual en 360, 390, 768 y 1440 px.

## Decisión

El estado cambia a **GO** únicamente cuando todas las casillas de las secciones 1, 2 y 3 estén completas y la verificación técnica no tenga errores bloqueantes.
