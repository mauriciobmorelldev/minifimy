"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { MiniCartDrawer } from "@/components/MiniCartDrawer";
import { ProductSearchSuggestions } from "@/components/ProductSearchSuggestions";
import { useCart } from "@/context/cart-context";
import { useProductSuggestions } from "@/hooks/use-product-suggestions";

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
  const [desktopCategoriesOpen, setDesktopCategoriesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileCategoryOpen, setMobileCategoryOpen] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [miniCartOpen, setMiniCartOpen] = useState(false);
  const [query, setQuery] = useState("");
  const desktopMenuRef = useRef<HTMLDivElement>(null);
  const desktopSearchButtonRef = useRef<HTMLButtonElement>(null);
  const mobileSearchButtonRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchPanelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const suggestions = useProductSuggestions(query, searchOpen, true);
  const hiddenRoutes = ["/cargando-70", "/cargando-99"];
  const closeMobileMenu = () => {
    setMobileOpen(false);
    setMobileCategoryOpen(null);
  };

  useEffect(() => {
    if (!desktopCategoriesOpen) return;
    const closeOutside = (event: PointerEvent) => {
      if (!desktopMenuRef.current?.contains(event.target as Node)) {
        setDesktopCategoriesOpen(false);
      }
    };

    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [desktopCategoriesOpen]);

  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    const previousOverscroll = document.body.style.overscrollBehavior;
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.overscrollBehavior = previousOverscroll;
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!searchOpen) return;

    const animationFrame = window.requestAnimationFrame(() => searchInputRef.current?.focus());
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        searchPanelRef.current?.contains(target) ||
        desktopSearchButtonRef.current?.contains(target) ||
        mobileSearchButtonRef.current?.contains(target)
      ) {
        return;
      }

      setSearchOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      window.cancelAnimationFrame(animationFrame);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [searchOpen]);

  const openAndFocusSearch = () => {
    if (searchOpen) {
      searchInputRef.current?.focus();
      return;
    }

    setSearchOpen(true);
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
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-[70] cursor-default bg-on-surface/20 backdrop-blur-[2px] lg:hidden"
          onClick={closeMobileMenu}
          aria-label="Cerrar menú"
          tabIndex={-1}
        />
      )}
      <nav
        className="fixed inset-x-0 top-0 z-[80] px-3 pt-3 md:px-5"
        aria-label="Principal"
      >
        <div className="liquid-header relative mx-auto flex max-w-7xl items-center justify-between rounded-[1.35rem] px-4 py-3 md:rounded-[1.7rem] md:px-6 md:py-3.5">
          <div className="flex items-center gap-3 lg:hidden">
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
            className="absolute left-1/2 flex -translate-x-1/2 items-center gap-3 lg:static lg:translate-x-0"
          >
            <Image
              src="/brand/logo.svg"
              alt="MiniFimy"
              width={140}
              height={40}
              className="h-7 w-auto md:h-9"
              priority
            />
            <span className="sr-only">MiniFimy</span>
          </Link>

          <div
            ref={desktopMenuRef}
            className="hidden items-center font-headline text-sm font-semibold tracking-wide lg:flex"
            onMouseLeave={() => setDesktopCategoriesOpen(false)}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setDesktopCategoriesOpen(false);
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setDesktopCategoriesOpen(false);
                desktopMenuRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
              }
            }}
          >
            <button
              type="button"
              onMouseEnter={() => setDesktopCategoriesOpen(true)}
              onFocus={() => setDesktopCategoriesOpen(true)}
              onClick={() => setDesktopCategoriesOpen((open) => !open)}
              aria-expanded={desktopCategoriesOpen}
              aria-controls="desktop-category-menu"
              className="inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-primary transition hover:bg-[#f7efe3] hover:text-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <span className="material-symbols-outlined text-xl" aria-hidden="true">menu</span>
              Categorías
              <span className={`material-symbols-outlined text-base transition-transform ${desktopCategoriesOpen ? "rotate-180" : ""}`} aria-hidden="true">expand_more</span>
            </button>

            <div
              id="desktop-category-menu"
              className={`absolute inset-x-0 top-full z-50 pt-3 transition duration-200 ${desktopCategoriesOpen ? "visible translate-y-0 opacity-100" : "invisible pointer-events-none -translate-y-2 opacity-0"}`}
            >
              <div className="grid max-h-[calc(100dvh-7rem)] grid-cols-5 gap-5 overflow-y-auto rounded-[1.5rem] bg-[#fffaf1] p-6 shadow-lift ring-1 ring-primary/10">
                {navLinks.map((group) => (
                  <section key={group.href} aria-labelledby={`menu-${group.label}`}>
                    <Link
                      id={`menu-${group.label}`}
                      href={group.href}
                      onClick={() => setDesktopCategoriesOpen(false)}
                      className="mb-3 block border-b border-primary/10 pb-3 text-base font-extrabold text-primary transition hover:text-secondary"
                    >
                      {group.label}
                    </Link>
                    <div className="flex flex-col gap-1">
                      {(group.children ?? []).map((child, index) => (
                        <Link
                          key={`${child.href}-${child.label}`}
                          href={child.href}
                          onClick={() => setDesktopCategoriesOpen(false)}
                          className={`rounded-lg px-2 py-2 text-sm leading-5 transition hover:bg-[#f7efe3] hover:text-primary ${index === 0 ? "font-bold text-primary" : "text-on-surface-variant"}`}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-5 text-primary lg:flex">
            <button
              ref={desktopSearchButtonRef}
              type="button"
              onClick={openAndFocusSearch}
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

          <div className="flex items-center gap-3 text-primary lg:hidden">
            <button
              ref={mobileSearchButtonRef}
              type="button"
              onClick={openAndFocusSearch}
              className="relative flex h-10 w-10 scale-95 items-center justify-center rounded-full bg-[#fffaf1] shadow-soft transition-transform duration-200 ease-soft-spring active:scale-90"
              aria-label="Buscar"
              aria-expanded={searchOpen}
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
            ref={searchPanelRef}
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
                  ref={searchInputRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Body nube, regalo, ajuar..."
                  className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-on-surface-variant/65"
                />
                <button type="submit" className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-on-primary">
                  Buscar
                </button>
              </div>
              <ProductSearchSuggestions
                suggestions={suggestions}
                query={query}
                onSelect={() => setSearchOpen(false)}
                className="mt-2"
              />
              <p className="px-4 pb-2 pt-3 text-xs text-on-surface-variant">
                Fimy puede ayudarte a encontrar regalos, tejidos y prendas para recién nacido.
              </p>
            </form>
          </div>

          <div
            className={`absolute left-0 right-0 top-[calc(100%+0.75rem)] z-[90] h-[calc(100dvh-6.75rem)] overflow-hidden overscroll-contain rounded-[1.6rem] border border-primary/10 bg-[#fffaf1] shadow-lift ring-1 ring-primary/10 transition-all duration-300 lg:hidden ${
              mobileOpen ? "translate-y-0 opacity-100" : "invisible pointer-events-none translate-y-3 opacity-0"
            }`}
          >
            <div className="h-full space-y-5 overflow-y-auto overscroll-contain px-4 py-4 pb-8 [scrollbar-gutter:stable]">
              <div className="rounded-[1.25rem] bg-[#f7efe3] px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Menú MiniFimy</p>
                <p className="mt-1 text-xs leading-5 text-on-surface-variant">Categorías y accesos de la tienda.</p>
              </div>
              <div className="flex flex-col gap-2 font-headline text-base font-semibold text-primary">
                {navLinks.map((link) => {
                  const hasChildren = Boolean(link.children?.length);
                  const linkPathname = link.href.split("?")[0];
                  const isCategoryOpen = hasChildren && mobileCategoryOpen === link.href;

                  if (hasChildren) {
                    return (
                      <div key={link.href} className="space-y-2">
                        <button
                          type="button"
                          onClick={() => setMobileCategoryOpen((prev) => prev === link.href ? null : link.href)}
                          aria-expanded={isCategoryOpen}
                          className={`flex min-h-12 w-full items-center justify-between rounded-[1.15rem] px-4 py-3 text-left shadow-soft transition-colors ${pathname.startsWith(linkPathname) ? "bg-primary text-on-primary" : "bg-white text-primary"}`}
                        >
                          <span>{link.label}</span>
                          <span className={`material-symbols-outlined text-lg transition-transform duration-300 ${isCategoryOpen ? "rotate-180" : ""}`}>expand_more</span>
                        </button>
                        <div
                          className={`ml-3 grid overflow-y-auto overscroll-contain rounded-[1.2rem] bg-white shadow-soft transition-all duration-300 ${isCategoryOpen ? "max-h-[55dvh] gap-2 p-3 opacity-100" : "invisible max-h-0 gap-0 p-0 opacity-0"}`}
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
