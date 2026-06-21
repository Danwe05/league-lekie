import Link from "next/link";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";

const links = [
  { href: "/", label: "Accueil" },
  { href: "/calendrier", label: "Calendrier & Résultats" },
  { href: "/classement", label: "Classement" },
  { href: "/clubs", label: "Clubs" },
  { href: "/actualites", label: "Actualités" },
  { href: "/a-propos", label: "La Ligue" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="font-heading font-bold text-2xl text-primary tracking-tight">
          LIGUE LÉKIÉ
        </Link>
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex gap-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors py-5 border-b-2 border-transparent hover:border-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <ThemeToggle />
          {/* Mobile Nav Trigger would go here */}
        </div>
      </div>
    </header>
  );
}
