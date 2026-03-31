"use client";

import { useState, type ReactNode } from "react";

interface FiltersPanelProps {
  title?: string;
  children: ReactNode;
}

export function FiltersPanel({ title = "Filtros", children }: FiltersPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full md:w-64">
      <div className="mb-4 flex items-center justify-between md:hidden">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant">
          {title}
        </span>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex items-center gap-2 rounded-md bg-surface-container-highest px-3 py-2 text-xs font-bold text-primary"
          aria-expanded={open}
          aria-controls="mobile-filters"
        >
          <span className="material-symbols-outlined text-sm">
            {open ? "close" : "tune"}
          </span>
          {open ? "Cerrar" : "Abrir"}
        </button>
      </div>

      <div
        id="mobile-filters"
        className={`overflow-hidden transition-all duration-300 md:overflow-visible md:transition-none ${
          open ? "max-h-[900px] opacity-100" : "max-h-0 opacity-0"
        } md:max-h-none md:opacity-100`}
      >
        <div className="rounded-lg bg-surface-container-low p-4 md:rounded-none md:bg-transparent md:p-0">
          {children}
        </div>
      </div>
    </div>
  );
}
