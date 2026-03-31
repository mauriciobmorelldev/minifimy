"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/context/cart-context";

const navLinks = [
  { href: "/catalogo", label: "Catálogo" },
  { href: "/catalogo/recien-nacido", label: "Recién nacido" },
  { href: "/catalogo/aventura", label: "Mini aventuras" },
  { href: "/catalogo/accesorios", label: "Accesorios" },
];

export function Header() {
  const { items } = useCart();
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <nav
      className="fixed top-0 z-50 w-full bg-background/80 glass-nav shadow-sm shadow-on-surface/5"
      aria-label="Principal"
    >
      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3 md:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="flex h-10 w-10 items-center justify-center rounded-md bg-surface-container-highest text-primary"
            aria-expanded={mobileOpen}
            aria-label="Abrir menú"
          >
            <span className="material-symbols-outlined">
              {mobileOpen ? "close" : "menu"}
            </span>
          </button>
        </div>

        <Link
          href="/"
          className="absolute left-1/2 flex -translate-x-1/2 items-center gap-3 md:static md:translate-x-0"
        >
          <Image
            src="/brand/logo.svg"
            alt="MINIFIMY"
            width={140}
            height={40}
            className="h-8 w-auto md:h-9"
            priority
          />
          <span className="sr-only">Minifimy</span>
        </Link>

        <div className="hidden items-center gap-8 font-headline text-sm font-medium tracking-wide md:flex">
          {navLinks.map((link, index) => (
            <Link
              key={link.href}
              href={link.href}
              className={`pb-1 transition-colors duration-300 ${
                index === 0
                  ? "text-secondary border-b-2 border-secondary"
                  : "text-primary hover:text-secondary"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-5 text-primary md:flex">
          <button
            type="button"
            className="scale-95 transition-transform duration-200 ease-soft-spring active:scale-90"
            aria-label="Buscar"
          >
            <span className="material-symbols-outlined">search</span>
          </button>
          <button
            type="button"
            className="scale-95 transition-transform duration-200 ease-soft-spring active:scale-90"
            aria-label="Favoritos"
          >
            <span className="material-symbols-outlined">favorite</span>
          </button>
          <Link
            href="/carrito"
            className="relative scale-95 transition-transform duration-200 ease-soft-spring active:scale-90"
            aria-label="Carrito"
          >
            <span className="material-symbols-outlined">shopping_basket</span>
            {count > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-on-secondary">
                {count}
              </span>
            )}
          </Link>
          <Link
            href="/cuenta"
            className="scale-95 transition-transform duration-200 ease-soft-spring active:scale-90"
            aria-label="Cuenta"
          >
            <span className="material-symbols-outlined">person</span>
          </Link>
        </div>

        <div className="flex items-center gap-3 text-primary md:hidden">
          <Link
            href="/carrito"
            className="relative scale-95 transition-transform duration-200 ease-soft-spring active:scale-90"
            aria-label="Carrito"
          >
            <span className="material-symbols-outlined">shopping_basket</span>
            {count > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-on-secondary">
                {count}
              </span>
            )}
          </Link>
        </div>

        <div
          className={`absolute left-0 right-0 top-full z-40 overflow-hidden border-t border-outline-variant/30 bg-surface-container/95 backdrop-blur-md transition-all duration-300 md:hidden ${
            mobileOpen ? "max-h-[520px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="space-y-6 px-6 py-6">
            <div className="flex items-center gap-4 text-primary">
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-md bg-surface-container-highest"
                aria-label="Buscar"
              >
                <span className="material-symbols-outlined">search</span>
              </button>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-md bg-surface-container-highest"
                aria-label="Favoritos"
              >
                <span className="material-symbols-outlined">favorite</span>
              </button>
              <Link
                href="/cuenta"
                className="flex h-10 w-10 items-center justify-center rounded-md bg-surface-container-highest"
                aria-label="Cuenta"
              >
                <span className="material-symbols-outlined">person</span>
              </Link>
            </div>
            <div className="flex flex-col gap-4 font-headline text-base font-semibold text-primary">
              {navLinks.map((link, index) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`pb-2 transition-colors ${
                    index === 0 ? "text-secondary" : "text-primary"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
