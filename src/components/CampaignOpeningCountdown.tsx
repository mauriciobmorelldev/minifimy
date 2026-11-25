"use client";

import { useEffect, useState } from "react";

export function CampaignOpeningCountdown({ remainingMs }: { remainingMs: number }) {
  const [seconds, setSeconds] = useState(Math.ceil(remainingMs / 1000));

  useEffect(() => {
    const started = performance.now();
    const timer = window.setInterval(() => {
      const remaining = Math.max(0, Math.ceil((remainingMs - (performance.now() - started)) / 1000));
      setSeconds(remaining);
      if (remaining === 0) {
        window.clearInterval(timer);
        window.location.replace("/");
      }
    }, 250);
    return () => window.clearInterval(timer);
  }, [remainingMs]);

  const units = [
    { label: "Horas", value: Math.floor(seconds / 3600) },
    { label: "Minutos", value: Math.floor(seconds / 60) % 60 },
    { label: "Segundos", value: seconds % 60 },
  ];

  return (
    <div role="timer" aria-label="Tiempo hasta la apertura" className="grid max-w-sm grid-cols-3 gap-2 sm:gap-3">
      {units.map(({ label, value }) => (
        <div key={label} className="grid gap-1 rounded-[0.85rem] border border-[#fff2ec]/20 bg-[#381b23] px-2 py-3 text-center">
          <span className="font-headline text-3xl font-extrabold leading-none tabular-nums sm:text-4xl">
            {String(value).padStart(2, "0")}
          </span>
          <span className="text-xs font-semibold text-[#f4c9c7]">{label}</span>
        </div>
      ))}
    </div>
  );
}
