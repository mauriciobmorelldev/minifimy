import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ProductCard } from "@/components/ProductCard";
import { CampaignArrow } from "@/components/CampaignArrow";
import { FlashSaleCountdown } from "@/components/FlashSaleCountdown";
import { blackFridayPreview, formatBlackFridayPrice, getBlackFridayPrice } from "@/lib/black-friday";
import type { CategoryOffer } from "@/lib/black-friday-products";
import type { Product } from "@/models/product";
import styles from "./BlackFridayHero.module.css";

const flashSaleStartsAt = Date.parse(
  blackFridayPreview ? "2026-11-22T15:57:00-03:00" : "2026-11-26T00:00:00-03:00",
);

function SaleShelf({ id, title, emphasis, products, emptyMessage, countdown }: {
  id: string;
  title: string;
  emphasis: string;
  products: Product[];
  emptyMessage?: string;
  countdown?: ReactNode;
}) {
  const first = products[0];
  const price = first && getBlackFridayPrice(first.price, first.prices);
  if (!price && !emptyMessage) return null;

  return (
    <section className={styles.flashSale} aria-labelledby={id}>
      <div className={styles.flashHeading}>
        {countdown}
        <h2 id={id}>{title} <em>{emphasis}</em></h2>
        <div className={styles.flashPrice}>
          {price ? (
            <>
              <span>Desde</span>
              <strong>{formatBlackFridayPrice(price.final)}</strong>
              <span>Por transferencia</span>
            </>
          ) : <strong><span className="sr-only">Precio no disponible</span><span aria-hidden="true">—</span></strong>}
        </div>
      </div>
      {products.length > 0 ? (
        <div className={`${styles.productGrid} ${styles.flashProducts}`}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              compactMobile
              sizes="(min-width: 768px) 320px, 224px"
            />
          ))}
        </div>
      ) : (
        <p className={styles.saleEmpty}>{emptyMessage}</p>
      )}
    </section>
  );
}

export function BlackFridayProducts({ flashSale, combosSale, categoryOffers }: {
  flashSale: Product[];
  combosSale: Product[];
  categoryOffers: CategoryOffer[];
}) {
  return (
    <div className={styles.catalogue}>
      <SaleShelf
        id="campaign-flash-sale"
        title="Flash"
        emphasis="Sale"
        products={flashSale}
        countdown={<FlashSaleCountdown startsAt={flashSaleStartsAt} />}
      />
      {categoryOffers.length > 0 && (
        <nav className={`${styles.collections} ${styles.categoryOffers}`} aria-label="Precios por categoría">
          {categoryOffers.map(({ label, href, price, image }) => (
            <Link key={label} href={href} prefetch={false}>
              {image && <Image src={image} alt="" fill sizes="(min-width: 768px) 420px, 33vw" />}
              <span>
                <span>
                  {label}
                  <small>{price === undefined ? "Ver categoría" : <>Desde <strong>{formatBlackFridayPrice(price)}</strong></>}</small>
                </span>
                <CampaignArrow />
              </span>
            </Link>
          ))}
        </nav>
      )}
      <SaleShelf
        id="campaign-combos-sale"
        title="Combos"
        emphasis="Black"
        products={combosSale}
        emptyMessage="Todavía no hay combos disponibles."
      />
      <nav className={styles.moreCategories} aria-label="Más categorías">
        <h2>Explorá más categorías</h2>
        <div>
          <Link href="/catalogo?q=body">Bodys <CampaignArrow /></Link>
          <Link href="/catalogo?q=pijama">Pijamas <CampaignArrow /></Link>
          <Link href="/catalogo/accesorios">Accesorios <CampaignArrow /></Link>
        </div>
      </nav>
    </div>
  );
}
