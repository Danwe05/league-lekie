import { getActualites } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ImageOff } from "lucide-react";

export const metadata: Metadata = {
  title: 'Actualités',
  description: "Toutes les dernières nouvelles de la Ligue Départementale de Football d'Obala : résultats, transferts, communiqués officiels.",
  openGraph: {
    title: 'Actualités | Ligue Lékié',
    description: "Suivez les dernières nouvelles de la ligue d'Obala.",
  },
}

export default async function ActualitesPage() {
  const actualites = await getActualites();
  return (
    <div className="container mx-auto px-4 py-12 flex-1">
      <h1 className="font-heading font-bold text-4xl uppercase tracking-tighter mb-8 border-b-4 border-primary inline-block pb-2">
        Actualités
      </h1>
      
      <div className="max-w-4xl space-y-8">
        {actualites.map(article => (
          <Link key={article.id} href={`/actualites/${article.id}`} className="block group">
            <Card className="border-border shadow-none rounded-xl overflow-hidden hover:border-primary/50 transition-colors">
              {article.imageUrl && (
                <div className="h-48 w-full overflow-hidden">
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <CardHeader className="bg-muted/30 pb-4">
                <span className="text-sm font-bold text-primary mb-2">
                  {new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(article.date))}
                </span>
                <CardTitle className="font-heading text-2xl leading-tight text-foreground group-hover:text-primary transition-colors">
                  {article.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 pb-5">
                <p className="text-muted-foreground leading-relaxed line-clamp-3">
                  {article.content}
                </p>
                <span className="inline-flex items-center gap-1 text-primary font-bold text-sm mt-3">
                  Lire la suite <ArrowRight className="w-4 h-4" />
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
