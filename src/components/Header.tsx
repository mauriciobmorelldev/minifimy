"use client";

import Image from "next/image";
import Link from "next/link";
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

  return (
    <nav
      className="fixed top-0 z-50 w-full bg-background/80 glass-nav shadow-sm shadow-on-surface/5"
      aria-label="Principal"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/brand/logo.svg"
            alt="MINIFIMY"
            width={140}
            height={40}
            className="h-8 w-auto"
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

        <div className="flex items-center gap-5 text-primary">
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
      </div>
    </nav>
  );
}
