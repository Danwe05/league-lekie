"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Users2,
  CalendarDays,
  Newspaper,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { logout } from "@/lib/actions";

const navLinks = [
  { href: "/admin", label: "Vue d'ensemble", icon: LayoutDashboard, exact: true },
  { href: "/admin/clubs", label: "Gestion des Clubs", icon: Users, exact: false },
  { href: "/admin/joueurs", label: "Joueurs", icon: Users2, exact: false },
  { href: "/admin/matchs", label: "Gestion des Matchs", icon: CalendarDays, exact: false },
  { href: "/admin/actualites", label: "Actualités", icon: Newspaper, exact: false },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-border">
        <Link
          href="/admin"
          onClick={onClose}
          className="font-heading font-bold text-2xl text-primary tracking-tight"
        >
          LIGUE ADMIN
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navLinks.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                active
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-muted text-foreground"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border space-y-1">
        <Link
          href="/"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-md"
        >
          ← Site public
        </Link>
        <form action={logout}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-md"
          >
            <LogOut className="w-4 h-4" /> Se déconnecter
          </button>
        </form>
      </div>
    </div>
  );
}

interface AdminShellProps {
  userEmail: string;
  userInitial: string;
  children: React.ReactNode;
}

export function AdminShell({ userEmail, userInitial, children }: AdminShellProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <div className="flex min-h-screen bg-muted/20">

      {/* ── Desktop static sidebar ── */}
      <aside className="hidden md:flex w-64 bg-card border-r border-border flex-col sticky top-0 h-screen shrink-0">
        <SidebarContent />
      </aside>

      {/* ── Mobile backdrop ── */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Mobile drawer ── */}
      <aside
        aria-hidden={!open}
        className={`
          fixed top-0 left-0 z-50 h-full w-72 bg-card border-r border-border shadow-2xl
          flex flex-col transition-transform duration-300 ease-in-out md:hidden
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <button
          className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-md hover:bg-muted transition-colors text-foreground"
          onClick={() => setOpen(false)}
          aria-label="Fermer le menu"
        >
          <X className="w-5 h-5" />
        </button>
        <SidebarContent onClose={() => setOpen(false)} />
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="h-16 bg-card border-b border-border flex items-center px-4 md:px-8 sticky top-0 z-10 w-full gap-3">
          {/* Hamburger — mobile only */}
          <button
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-md hover:bg-muted transition-colors text-foreground shrink-0"
            onClick={() => setOpen(true)}
            aria-label="Ouvrir le menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <h2 className="font-heading font-bold text-lg flex-1">Espace Administration</h2>

          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">{userEmail}</span>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
              {userInitial}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
