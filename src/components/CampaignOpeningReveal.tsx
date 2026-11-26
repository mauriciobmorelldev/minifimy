"use client";

import { useEffect, useState } from "react";
import styles from "./CampaignOpeningReveal.module.css";

export function CampaignOpeningReveal({ opensAt }: { opensAt: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const frame = window.requestAnimationFrame(() => {
      try {
        const key = `minifimy-opening-reveal:${opensAt}`;
        if (window.sessionStorage.getItem(key)) return;
        window.sessionStorage.setItem(key, "shown");
      } catch {
        // The reveal can still play when browser storage is disabled.
      }
      setVisible(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [opensAt]);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className={styles.reveal}
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget) setVisible(false);
      }}
    >
      <div className={styles.left} />
      <div className={styles.right} />
      <span className={styles.message}>Ya abrimos</span>
    </div>
  );
}
