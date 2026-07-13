"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { MiniCartDrawer } from "@/components/MiniCartDrawer";
import { useCart } from "@/context/cart-context";

type NavLink = {
  href: string;
  label: string;
  children?: NavLink[];
};

interface HeaderProps {
  navLinks: NavLink[];
}

export function Header({ navLinks }: HeaderProps) {
  const { items } = useCart();
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileCatalogOpen, setMobileCatalogOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [miniCartOpen, setMiniCartOpen] = useState(false);
  const [query, setQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const hiddenRoutes = ["/cargando-70", "/cargando-99"];
  const closeMobileMenu = () => {
    setMobileOpen(false);
    setMobileCatalogOpen(false);
  };

  if (hiddenRoutes.includes(pathname)) {
    return null;
  }

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = query.trim();
    router.push(normalized ? `/catalogo?q=${encodeURIComponent(normalized)}` : "/catalogo");
    setSearchOpen(false);
    setMobileOpen(false);
  };

  return (
    <>
      <nav
        className="fixed inset-x-0 top-0 z-[80] px-3 pt-3 md:px-5"
        aria-label="Principal"
      >
        <div className="liquid-header relative mx-auto flex max-w-7xl items-center justify-between rounded-[1.35rem] px-4 py-3 md:rounded-[1.7rem] md:px-6 md:py-3.5">
          <div className="flex items-center gap-3 md:hidden">
            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fffaf1] text-primary shadow-soft ring-1 ring-primary/10"
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
            onClick={closeMobileMenu}
            className="absolute left-1/2 flex -translate-x-1/2 items-center gap-3 md:static md:translate-x-0"
          >
            <Image
              src="/brand/logo.svg"
              alt="MINIFIMY"
              width={140}
              height={40}
              className="h-7 w-auto md:h-9"
              priority
            />
            <span className="sr-only">Minifimy</span>
          </Link>

          <div className="hidden items-center gap-7 font-headline text-sm font-medium tracking-wide md:flex">
            {navLinks.map((link) => {
              const active = pathname === link.href || (link.href !== "/catalogo" && pathname.startsWith(link.href));
              if (link.children?.length) {
                return (
                  <div key={link.href} className="group relative pb-3">
                    <Link
                      href={link.href}
                      className={`inline-flex items-center gap-1 transition-colors duration-300 ${active ? "border-b-2 border-secondary text-secondary" : "text-primary hover:text-secondary"}`}
                    >
                      {link.label}
                      <span className="material-symbols-outlined text-base transition-transform group-hover:rotate-180">expand_more</span>
                    </Link>
                    <div className="pointer-events-none absolute left-1/2 top-full z-50 w-72 -translate-x-1/2 translate-y-1 pt-3 opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
                      <div className="rounded-[1.4rem] bg-white p-3 shadow-lift ring-1 ring-primary/10">
                      <div className="mb-2 rounded-[1rem] bg-[#f7efe3] px-4 py-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Categorias</p>
                        <p className="mt-1 text-xs leading-5 text-on-surface-variant">Todo lo que esta cargado en Fimy.</p>
                      </div>
                      <div className="grid gap-1">
                        {link.children.map((child) => (
                          <Link
                            key={`${child.href}-${child.label}`}
                            href={child.href}
                            className="rounded-full px-4 py-2 text-sm font-bold text-primary transition hover:bg-[#f7efe3] hover:text-secondary"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                      </div>
                    </div>
                  </div>
                );
              }
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`pb-1 transition-colors duration-300 ${active ? "border-b-2 border-secondary text-secondary" : "text-primary hover:text-secondary"}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="hidden items-center gap-5 text-primary md:flex">
            <button
              type="button"
              onClick={() => setSearchOpen((prev) => !prev)}
              className="scale-95 transition-transform duration-200 ease-soft-spring active:scale-90"
              aria-label="Buscar"
              aria-expanded={searchOpen}
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
            <button
              type="button"
              onClick={() => setMiniCartOpen(true)}
              className="relative flex h-10 w-10 scale-95 items-center justify-center rounded-full bg-[#fffaf1] shadow-soft transition-transform duration-200 ease-soft-spring active:scale-90"
              aria-label="Abrir carrito"
            >
              <span className="material-symbols-outlined">shopping_basket</span>
              {count > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-on-secondary">
                  {count}
                </span>
              )}
            </button>
            <Link
              href="/cuenta"
              className="scale-95 transition-transform duration-200 ease-soft-spring active:scale-90"
              aria-label="Cuenta"
            >
              <span className="material-symbols-outlined">person</span>
            </Link>
          </div>

          <div className="flex items-center gap-3 text-primary md:hidden">
            <button
              type="button"
              onClick={() => setSearchOpen((prev) => !prev)}
              className="relative flex h-10 w-10 scale-95 items-center justify-center rounded-full bg-[#fffaf1] shadow-soft transition-transform duration-200 ease-soft-spring active:scale-90"
              aria-label="Buscar"
            >
              <span className="material-symbols-outlined">search</span>
            </button>
            <button
              type="button"
              onClick={() => setMiniCartOpen(true)}
              className="relative flex h-10 w-10 scale-95 items-center justify-center rounded-full bg-[#fffaf1] shadow-soft transition-transform duration-200 ease-soft-spring active:scale-90"
              aria-label="Abrir carrito"
            >
              <span className="material-symbols-outlined">shopping_basket</span>
              {count > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-on-secondary">
                  {count}
                </span>
              )}
            </button>
          </div>

          <div
            className={`absolute left-6 right-6 top-full z-40 overflow-hidden rounded-[1.5rem] bg-white shadow-lift transition-all duration-300 md:left-auto md:right-6 md:w-[420px] ${
              searchOpen ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
            }`}
          >
            <form onSubmit={submitSearch} className="p-3">
              <label className="sr-only" htmlFor="site-search">Buscar productos</label>
              <div className="flex items-center gap-3 rounded-full bg-[#f7efe3] px-4 py-2">
                <span className="material-symbols-outlined text-primary">search</span>
                <input
                  id="site-search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Body nube, regalo, ajuar..."
                  className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-on-surface-variant/65"
                />
                <button type="submit" className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-on-primary">
                  Buscar
                </button>
              </div>
              <p className="px-4 pb-2 pt-3 text-xs text-on-surface-variant">
                Fimy puede ayudarte a encontrar regalos, tejidos y prendas para recién nacido.
              </p>
            </form>
          </div>

          <div
            className={`absolute left-2 right-2 top-[calc(100%+0.75rem)] z-[90] overflow-hidden rounded-[1.6rem] border border-primary/10 bg-[#fffaf1] shadow-lift ring-1 ring-primary/10 transition-all duration-300 md:hidden ${
              mobileOpen ? "max-h-[calc(100vh-6rem)] opacity-100" : "pointer-events-none max-h-0 opacity-0"
            }`}
          >
            <div className="max-h-[calc(100vh-7rem)] space-y-5 overflow-y-auto px-4 py-4">
              <div className="rounded-[1.25rem] bg-[#f7efe3] px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Menu Minifimy</p>
                <p className="mt-1 text-xs leading-5 text-on-surface-variant">Categorias y accesos de la tienda.</p>
              </div>
              <div className="flex flex-col gap-2 font-headline text-base font-semibold text-primary">
                {navLinks.map((link) => {
                  const hasChildren = Boolean(link.children?.length);
                  const isCatalogOpen = hasChildren && mobileCatalogOpen;

                  if (hasChildren) {
                    return (
                      <div key={link.href} className="space-y-2">
                        <button
                          type="button"
                          onClick={() => setMobileCatalogOpen((prev) => !prev)}
                          aria-expanded={isCatalogOpen}
                          className={`flex w-full items-center justify-between rounded-[1.15rem] px-4 py-3 text-left shadow-soft transition-colors ${pathname.startsWith(link.href) ? "bg-primary text-on-primary" : "bg-white text-primary"}`}
                        >
                          <span>{link.label}</span>
                          <span className={`material-symbols-outlined text-lg transition-transform duration-300 ${isCatalogOpen ? "rotate-180" : ""}`}>expand_more</span>
                        </button>
                        <div
                          className={`ml-3 grid overflow-hidden rounded-[1.2rem] bg-white shadow-soft transition-all duration-300 ${isCatalogOpen ? "max-h-[420px] gap-2 p-3 opacity-100" : "max-h-0 gap-0 p-0 opacity-0"}`}
                        >
                          {link.children?.map((child) => (
                            <Link key={`${child.href}-${child.label}`} href={child.href} onClick={closeMobileMenu} className="rounded-full bg-[#f7efe3] px-3 py-2 text-sm font-bold text-primary/90">
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={link.href} className="space-y-2">
                      <Link
                        href={link.href}
                        onClick={closeMobileMenu}
                        className={`flex items-center justify-between rounded-[1.15rem] px-4 py-3 shadow-soft transition-colors ${pathname === link.href ? "bg-primary text-on-primary" : "bg-white text-primary"}`}
                      >
                        {link.label}
                        <span className="material-symbols-outlined text-lg">chevron_right</span>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </nav>
      <MiniCartDrawer open={miniCartOpen} onClose={() => setMiniCartOpen(false)} />
    </>
  );
}
