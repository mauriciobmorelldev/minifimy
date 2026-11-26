"use client";

import { useEffect, useState } from "react";
import styles from "./BlackFridayHero.module.css";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function FlashSaleCountdown({ endsAt }: { endsAt: number }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    function update() {
      const current = Date.now();
      setNow(current);
      if (current >= endsAt) window.clearInterval(timer);
    }

    const timer = window.setInterval(update, 1000);
    const frame = window.requestAnimationFrame(update);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearInterval(timer);
    };
  }, [endsAt]);

  if (now === null) {
    return <span className={styles.flashCountdown} aria-hidden="true">--:--:--</span>;
  }

  const remainingSeconds = Math.max(0, Math.ceil((endsAt - now) / 1000));
  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor(remainingSeconds / 60) % 60;
  const seconds = remainingSeconds % 60;
  return (
    <span
      className={styles.flashCountdown}
      role="timer"
      aria-label={`Flash Sale, ${hours} horas, ${minutes} minutos y ${seconds} segundos`}
    >
      {pad(hours)}:{pad(minutes)}:{pad(seconds)}
    </span>
  );
}
