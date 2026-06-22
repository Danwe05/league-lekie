"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { GlobalSearch } from "@/components/GlobalSearch";

const NAV_LINKS = [
  { href: "/",           label: "Accueil" },
  { href: "/calendrier", label: "Calendrier" },
  { href: "/classement", label: "Classement" },
  { href: "/clubs",      label: "Clubs" },
  { href: "/actualites", label: "Actualités" },
  { href: "/bureau",     label: "Bureau" },
  { href: "/a-propos",   label: "La Ligue" },
  { href: "/contact",    label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close on route change
  useEffect(() => setOpen(false), [pathname]);

  // Close on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">

          {/* Logo gauche: Ligue */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center overflow-hidden border border-border/50 shrink-0 shadow-sm relative">
                <img src="/logo.jpg" alt="Ligue Lékié" className="w-full h-full object-cover z-10" onError={e => { e.currentTarget.style.display = 'none'; }} />
            </div>
            <span className="font-heading font-bold text-xl text-primary tracking-tight hidden sm:block">LIGUE LÉKIÉ</span>
          </Link>

          {/* Desktop nav — lg and up */}
          <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`text-sm font-medium px-3 py-1.5 rounded-md whitespace-nowrap transition-colors
                  ${pathname === href
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-muted hover:text-primary"}`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right: Search + FECAFOOT Logo + theme toggle + hamburger */}
          <div className="flex items-center gap-3 md:gap-4 shrink-0">
            <div className="hidden lg:block w-64 xl:w-72">
              <GlobalSearch />
            </div>

            {/* Logo droite: FECAFOOT */}
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center overflow-hidden border border-border/50 shrink-0 shadow-sm relative">
                <img src="/fecafoot.png" alt="FECAFOOT" className="w-8 h-8 md:w-9 md:h-9 object-contain z-10" onError={e => { e.currentTarget.style.display = 'none'; }} />
            </div>

            <div className="border-l border-border/50 h-8 mx-1 hidden sm:block" />

            <ThemeToggle />
            <button
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-md hover:bg-muted transition-colors"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={open}
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </header>

      {/* Mobile drawer — outside header so it overlays full page */}
      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300
          ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      />

      {/* Slide-in panel */}
      <nav
        className={`fixed top-0 right-0 z-50 h-full w-72 bg-card border-l border-border shadow-2xl
          flex flex-col gap-1 pt-20 pb-8 px-6
          transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <button
          className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-md hover:bg-muted transition-colors"
          onClick={() => setOpen(false)}
          aria-label="Fermer le menu"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6 z-50">
          <GlobalSearch />
        </div>

        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
          Navigation
        </p>

        {NAV_LINKS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`px-3 py-3 text-sm font-medium rounded-lg transition-colors border-b border-border/40 last:border-0
              ${pathname === href
                ? "text-primary bg-primary/5"
                : "text-foreground hover:bg-muted hover:text-primary"}`}
          >
            {label}
          </Link>
        ))}
      </nav>
    </>
  );
}
