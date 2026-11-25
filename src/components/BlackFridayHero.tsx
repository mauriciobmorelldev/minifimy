import Image from "next/image";
import Link from "next/link";
import { BlackFridayBenefitRail } from "@/components/BlackFridayBenefitRail";
import { CampaignArrow } from "@/components/CampaignArrow";
import { BLACK_FRIDAY_CATEGORY_IMAGES, BLACK_FRIDAY_DISCOUNT, BLACK_FRIDAY_INSTALLMENTS, formatBlackFridayPrice, LOCAL_SHIPPING_GOAL, NATIONAL_SHIPPING_GOAL } from "@/lib/black-friday";
import styles from "./BlackFridayHero.module.css";

export function BlackFridayHero() {
  return (
    <section className={styles.shell} aria-labelledby="black-friday-title">
      <div className={styles.campaign}>
        <div className={`${styles.hero} ${styles.campaignSurface}`}>
          <div className={styles.heroPhoto}>
            <Image src="/brand/hero/home-banner-3.jpeg" alt="" fill unoptimized preload />
          </div>
          <div className={styles.heroCopy}>
            <h1 id="black-friday-title" className={styles.campaignTitle}>Black <span className={styles.campaignRibbon}>Friday</span></h1>
            <p>Del 26 al 29 de noviembre</p>
            <Link href="/catalogo">Ver catálogo <CampaignArrow /></Link>
          </div>
        </div>
        <BlackFridayBenefitRail>
          <article className={`${styles.benefit} ${styles.paymentBanner}`} aria-label="Medios de pago">
            <div className={styles.benefitLead}>
              <span>Hasta</span>
              <strong>{BLACK_FRIDAY_DISCOUNT}%</strong>
              <span>de descuento</span>
            </div>
            <div className={styles.benefitDetails}>
              <p>Pagando por <b>transferencia</b></p>
              <p>Hasta <b>{BLACK_FRIDAY_INSTALLMENTS} cuotas</b> sin interés</p>
            </div>
          </article>
          <article className={`${styles.benefit} ${styles.shippingBanner}`} aria-label="Envíos gratis">
            <p className={styles.benefitLead}><span>Envío</span> <strong>gratis</strong></p>
            <div className={styles.benefitDetails}>
              <p>Corrientes Capital <b>desde {formatBlackFridayPrice(LOCAL_SHIPPING_GOAL)}</b></p>
              <p>Todo el país <b>desde {formatBlackFridayPrice(NATIONAL_SHIPPING_GOAL)}</b></p>
            </div>
          </article>
        </BlackFridayBenefitRail>
      </div>

      <nav className={styles.collections} aria-label="Categorías destacadas">
        <Link href="/catalogo?etapa=bebes&publico=bebes" prefetch={false}>
          <Image src={BLACK_FRIDAY_CATEGORY_IMAGES.bebes} alt="" fill unoptimized />
          <span>Bebés <CampaignArrow /></span>
        </Link>
        <Link href="/catalogo?etapa=ninos&publico=ninos" prefetch={false}>
          <Image src={BLACK_FRIDAY_CATEGORY_IMAGES.ninos} alt="" fill unoptimized />
          <span>Niños <CampaignArrow /></span>
        </Link>
        <Link href="/catalogo?etapa=ninos&publico=ninas" prefetch={false}>
          <Image src={BLACK_FRIDAY_CATEGORY_IMAGES.ninas} alt="" fill unoptimized />
          <span>Niñas <CampaignArrow /></span>
        </Link>
      </nav>
    </section>
  );
}
