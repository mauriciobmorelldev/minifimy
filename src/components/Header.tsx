"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { MiniCartDrawer } from "@/components/MiniCartDrawer";
import { ProductSearchSuggestions } from "@/components/ProductSearchSuggestions";
import { useCart } from "@/context/cart-context";
import { useProductSuggestions } from "@/hooks/use-product-suggestions";
import { isStoreMenuGroupActive } from "@/lib/category-menu";

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
  const [mobileAgeContext, setMobileAgeContext] = useState<string | null>(null);
  const [mobileAudienceContext, setMobileAudienceContext] = useState<string | null>(null);
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
  const toggleMobileMenu = () => {
    if (!mobileOpen) {
      const params = new URLSearchParams(window.location.search);
      setMobileAgeContext(params.get("etapa"));
      setMobileAudienceContext(params.get("publico"));
    }
    setMobileOpen((open) => !open);
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
        className="fixed inset-x-0 top-0 z-[80]"
        aria-label="Principal"
      >
        <div className="hidden lg:block">
          <div className="flex min-h-8 items-center justify-center bg-secondary-container px-6 text-center font-headline text-[11px] font-extrabold uppercase tracking-[0.14em] text-on-secondary-container">
            3 cuotas sin interés
            <span className="mx-3 h-1 w-1 rounded-full bg-secondary" aria-hidden="true" />
            Envíos a todo el país
          </div>

          <div className="bg-[#d8e0c3] shadow-sm">
            <div className="mx-auto grid min-h-20 max-w-7xl grid-cols-[minmax(18rem,1fr)_auto_minmax(18rem,1fr)] items-center gap-8 px-8">
              <form onSubmit={submitSearch} className="max-w-[24rem]">
                <label className="sr-only" htmlFor="desktop-site-search">Buscar productos desde el encabezado</label>
                <div className="flex min-h-11 items-center rounded-lg bg-white/95 px-4 shadow-soft ring-1 ring-primary/10 transition focus-within:ring-2 focus-within:ring-primary/30">
                  <input
                    id="desktop-site-search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="¿Qué estás buscando?"
                    className="min-w-0 flex-1 bg-transparent pr-3 text-sm text-on-surface outline-none placeholder:text-on-surface-variant/65"
                  />
                  <button type="submit" className="flex h-9 w-9 items-center justify-center text-primary" aria-label="Ir">
                    <span className="material-symbols-outlined">search</span>
                  </button>
                </div>
              </form>

              <Link href="/" className="flex items-center justify-center">
                <Image src="/brand/logo.svg" alt="" width={168} height={48} className="h-11 w-auto" priority />
                <span className="sr-only">MiniFimy</span>
              </Link>

              <div className="flex items-center justify-end gap-5 text-primary">
                <Link href="/cuenta" className="flex items-center gap-2 text-sm font-bold transition hover:text-secondary">
                  <span className="material-symbols-outlined text-2xl" aria-hidden="true">person</span>
                  <span className="leading-tight">
                    <span className="block">Mi cuenta</span>
                    <span className="block text-[11px] font-medium text-on-surface-variant">Ingresar o registrarse</span>
                  </span>
                </Link>
                <button type="button" onClick={() => setMiniCartOpen(true)} className="relative flex h-11 w-11 items-center justify-center rounded-full bg-[#fffaf1] shadow-soft transition hover:-translate-y-0.5" aria-label="Abrir carrito">
                  <span className="material-symbols-outlined">shopping_basket</span>
                  {count > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-secondary px-1 text-[10px] font-bold text-on-secondary">{count}</span>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div
            ref={desktopMenuRef}
            className="relative border-b border-primary/10 bg-[#fffaf1] shadow-sm"
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
            <div className="mx-auto flex min-h-14 max-w-7xl items-stretch px-6">
              <button
                type="button"
                onMouseEnter={() => setDesktopCategoriesOpen(true)}
                onFocus={() => setDesktopCategoriesOpen(true)}
                onClick={() => setDesktopCategoriesOpen((open) => !open)}
                aria-expanded={desktopCategoriesOpen}
                aria-controls="desktop-category-menu"
                className="mr-4 inline-flex min-h-14 items-center gap-2 border-r border-primary/10 pr-6 font-headline text-xs font-extrabold uppercase tracking-[0.08em] text-primary transition hover:text-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary"
              >
                <span className="material-symbols-outlined text-xl" aria-hidden="true">menu</span>
                Categorías
                <span className={`material-symbols-outlined text-base transition-transform ${desktopCategoriesOpen ? "rotate-180" : ""}`} aria-hidden="true">expand_more</span>
              </button>

              <div className="flex min-w-0 flex-1 items-center justify-center gap-1">
                {[
                  { href: "/", label: "Inicio" },
                  { href: "/catalogo/nueva-temporada", label: "Nueva temporada" },
                  { href: "/catalogo/ultimas-oportunidades", label: "Oportunidades" },
                  { href: "/envios-y-cambios", label: "Envíos y cambios" },
                  { href: "/contacto", label: "Contacto" },
                ].map((link) => {
                  const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                  return (
                    <Link key={link.href} href={link.href} className={`inline-flex min-h-14 items-center px-4 font-headline text-xs font-bold uppercase tracking-[0.045em] transition hover:text-secondary ${active ? "text-secondary" : "text-on-surface-variant"}`}>
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div
              id="desktop-category-menu"
              className={`absolute inset-x-0 top-full z-50 border-b border-primary/10 bg-[#fffaf1] shadow-lift transition duration-200 ${desktopCategoriesOpen ? "visible translate-y-0 opacity-100" : "invisible pointer-events-none -translate-y-2 opacity-0"}`}
            >
              <div className="mx-auto grid max-h-[calc(100dvh-11rem)] max-w-7xl grid-cols-5 gap-7 overflow-y-auto px-8 py-7">
                {navLinks.map((group) => (
                  <section key={group.href} aria-labelledby={`menu-${group.label}`}>
                    <Link id={`menu-${group.label}`} href={group.href} onClick={() => setDesktopCategoriesOpen(false)} className="mb-3 block border-b border-primary/10 pb-3 text-base font-extrabold text-primary transition hover:text-secondary">
                      {group.label}
                    </Link>
                    <div className="flex flex-col gap-1">
                      {(group.children ?? []).map((child, index) => (
                        <Link key={`${child.href}-${child.label}`} href={child.href} onClick={() => setDesktopCategoriesOpen(false)} className={`rounded-lg px-2 py-2 text-sm leading-5 transition hover:bg-[#f7efe3] hover:text-primary ${index === 0 ? "font-bold text-primary" : "text-on-surface-variant"}`}>
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex min-h-7 items-center justify-center bg-secondary-container px-4 text-center font-headline text-[9px] font-extrabold uppercase tracking-[0.11em] text-on-secondary-container lg:hidden">
          3 cuotas sin interés
          <span className="mx-2 h-1 w-1 rounded-full bg-secondary" aria-hidden="true" />
          Envíos a todo el país
        </div>

        <div className="relative flex min-h-16 w-full items-center justify-between bg-[#d8e0c3] px-4 py-2.5 shadow-sm lg:hidden">
          <div className="flex items-center gap-3 lg:hidden">
            <button
              type="button"
              onClick={toggleMobileMenu}
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
              className="h-8 w-auto md:h-9"
              priority
            />
            <span className="sr-only">MiniFimy</span>
          </Link>

          <div
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
              aria-controls="legacy-desktop-category-menu"
              className="inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-primary transition hover:bg-[#f7efe3] hover:text-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <span className="material-symbols-outlined text-xl" aria-hidden="true">menu</span>
              Categorías
              <span className={`material-symbols-outlined text-base transition-transform ${desktopCategoriesOpen ? "rotate-180" : ""}`} aria-hidden="true">expand_more</span>
            </button>

            <div
              id="legacy-desktop-category-menu"
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
                  const isCategoryOpen = hasChildren && mobileCategoryOpen === link.href;
                  const isActive = isStoreMenuGroupActive(link, pathname, mobileAgeContext, mobileAudienceContext);

                  if (hasChildren) {
                    return (
                      <div key={link.href} className="space-y-2">
                        <button
                          type="button"
                          onClick={() => setMobileCategoryOpen((prev) => prev === link.href ? null : link.href)}
                          aria-expanded={isCategoryOpen}
                          aria-current={isActive ? "page" : undefined}
                          className={`flex min-h-12 w-full items-center justify-between rounded-[1.15rem] px-4 py-3 text-left shadow-soft transition-colors ${isActive ? "bg-primary text-on-primary" : "bg-white text-primary"}`}
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
      <div className="h-3 lg:h-[5.5rem]" aria-hidden="true" />
      <MiniCartDrawer open={miniCartOpen} onClose={() => setMiniCartOpen(false)} />
    </>
  );
}
