"use client";

import { useRef, useState, type ReactNode } from "react";
import styles from "./BlackFridayHero.module.css";

export function BlackFridayBenefitRail({ children }: { children: ReactNode }) {
  const track = useRef<HTMLDivElement>(null);
  const [atShipping, setAtShipping] = useState(false);

  return (
    <section className={styles.rail} aria-label="Beneficios de Black Friday">
      <div
        ref={track}
        id="black-friday-benefits"
        className={styles.track}
        onScroll={({ currentTarget }) => {
          const { scrollLeft, scrollWidth, clientWidth } = currentTarget;
          setAtShipping(scrollLeft > (scrollWidth - clientWidth) / 2);
        }}
      >
        {children}
      </div>
      <div className={styles.railControls} aria-label="Elegí un beneficio">
        <button type="button" aria-pressed={!atShipping} aria-controls="black-friday-benefits" onClick={() => track.current?.scrollTo({ left: 0 })}>
          Pago
        </button>
        <button type="button" aria-pressed={atShipping} aria-controls="black-friday-benefits" onClick={() => track.current?.scrollTo({ left: track.current.scrollWidth })}>
          Envíos
        </button>
      </div>
    </section>
  );
}
