import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 flex-1">
      <h1 className="font-heading font-bold text-4xl uppercase tracking-tighter mb-8 border-b-4 border-primary inline-block pb-2">
        La Ligue
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-6 text-foreground text-lg leading-relaxed">
          <p>
            La <strong className="text-primary">Ligue Départementale de Football de la Lékié</strong> (Obala) est l'organe directeur du football au niveau de notre département. Sous l'égide des instances nationales, nous avons la responsabilité d'organiser, de réguler et de développer les compétitions locales.
          </p>
          <p>
            Notre mission est de promouvoir le talent local, de structurer les clubs et d'offrir au public des évènements sportifs de qualité, ancrés dans les valeurs de fair-play et de solidarité.
          </p>
        </div>
        
        <div className="space-y-8 flex flex-col">
          <Card className="border-border shadow-none rounded-xl bg-muted/30 flex-1">
            <CardHeader>
              <CardTitle className="font-heading text-2xl uppercase">Bureau Exécutif</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="flex flex-col"><span className="text-muted-foreground text-sm font-medium">Président</span> <span className="font-bold text-foreground">M. Le Président</span></li>
                <li className="flex flex-col"><span className="text-muted-foreground text-sm font-medium">Secrétaire Général</span> <span className="font-bold text-foreground">M. Le Secrétaire</span></li>
              </ul>
            </CardContent>
          </Card>
          
          <Card className="border-border shadow-none rounded-xl border-primary/40 bg-[#C75D2C]/5">
            <CardHeader>
              <CardTitle className="font-heading text-xl uppercase flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" /> Règlement Intérieur
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground mb-4">
                Consultez le règlement officiel des compétitions organisées par la ligue pour la saison en cours.
              </p>
              <Link href="#" className={`${buttonVariants({ variant: "default" })} font-bold w-full sm:w-auto`}>
                Télécharger le PDF
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
