"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export function MinifimyIntroLoader() {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const leaveTimer = window.setTimeout(() => setLeaving(true), 1750);
    const hideTimer = window.setTimeout(() => setVisible(false), 2200);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div className={`intro-loader ${leaving ? "intro-loader-out" : ""}`} role="status" aria-live="polite" aria-label="Cargando Minifimy">
      <div className="intro-loader-mark">
        <Image src="/brand/logo.svg" alt="Minifimy" width={210} height={70} priority className="h-auto w-52" />
      </div>
      <div className="intro-loader-line" aria-hidden="true">
        <span />
      </div>
      <span className="sr-only">Cargando Minifimy</span>
    </div>
  );
}
