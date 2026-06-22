import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Mail, Phone } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Membres du Bureau",
  description: "Découvrez l'équipe dirigeante et les membres du bureau de la Ligue Départementale de Football de la Lékié.",
};

// Modèle de données pour les membres du bureau
const BUREAU_MEMBERS = [
  {
    name: "Nomo Awono François Janvier",
    role: "Président de la Ligue",
    description: "Pilote les grandes orientations stratégiques et la vision de développement du football dans la Lékié.",
    photoUrl: "/photo-president-ligue.jpg",
  },
  {
    name: "Nom du Vice-Président",
    role: "1er Vice-Président",
    description: "Assiste le président dans ses fonctions et supervise les commissions sportives.",
    photoUrl: "", // Utilisera un fallback si vide
  },
  {
    name: "Secrétaire Général",
    role: "Secrétariat Général",
    description: "Gère l'administration quotidienne, les licences et la correspondance officielle avec la FECAFOOT.",
    photoUrl: "",
  },
  {
    name: "Trésorier Général",
    role: "Pôle Financier",
    description: "Assure la gestion financière et la transparence du budget de la ligue départementale.",
    photoUrl: "",
  },
  {
    name: "Directeur Technique",
    role: "Pôle Technique",
    description: "Supervise la formation, l'arbitrage et la conformité technique des compétitions.",
    photoUrl: "",
  },
  {
    name: "Responsable Communication",
    role: "Pôle Médias & Sponsoring",
    description: "Gère les relations publiques, les réseaux sociaux et la recherche de partenaires institutionnels.",
    photoUrl: "",
  }
];

export default function BureauPage() {
  return (
    <main className="flex-1 pb-20">
      {/* Hero Header */}
      <section className="bg-primary pt-24 pb-20 px-4 text-center text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="container mx-auto relative z-10">
          <h1 className="font-heading font-bold text-5xl md:text-6xl tracking-tight mb-4">
            Bureau Exécutif
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto">
            L'équipe dirigeante engagée pour le rayonnement du football dans le département de la Lékié.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 -mt-8 relative z-20">
        <div className="bg-card border border-border shadow-md rounded-[2rem] p-6 md:p-12 mb-12">
          <Breadcrumbs items={[{ label: "Bureau Exécutif" }]} />
          
          <div className="mt-12">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-4">Notre Équipe Dirigeante</h2>
              <div className="h-1.5 w-16 bg-primary mx-auto rounded-full mb-6" />
              <p className="text-muted-foreground text-lg leading-relaxed">
                Des hommes et des femmes passionnés, travaillant chaque jour avec rigueur pour offrir le meilleur du football aux clubs, joueurs et supporters de la Lékié.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 gap-y-12">
              {BUREAU_MEMBERS.map((member, idx) => (
                <div key={idx} className="group flex flex-col pt-8">
                  <div className="relative bg-card rounded-2xl border border-border shadow-sm flex flex-col p-6 pt-16 hover:shadow-lg hover:border-primary/30 transition-all duration-300">
                    
                    {/* Avatar Float */}
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-28 h-28 rounded-full border-4 border-card bg-muted flex items-center justify-center overflow-hidden shadow-md group-hover:scale-105 transition-transform duration-300">
                      {member.photoUrl ? (
                        <img 
                          src={member.photoUrl} 
                          alt={member.name} 
                          className="w-full h-full object-cover object-top" 
                        />
                      ) : (
                        <span className="font-bold text-3xl text-muted-foreground uppercase">{member.name.substring(0, 2)}</span>
                      )}
                    </div>
                    
                    {/* Infos textuelles */}
                    <div className="text-center flex-1 flex flex-col">
                      <h3 className="font-heading font-bold text-xl text-foreground line-clamp-1">{member.name}</h3>
                      <p className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest rounded-full mt-3 mb-5 mx-auto">
                        {member.role}
                      </p>
                      <p className="text-muted-foreground text-sm leading-relaxed flex-1">
                        {member.description}
                      </p>
                    </div>

                    {/* Social / Contact (Optional decorative placeholder) */}
                    <div className="mt-6 pt-5 border-t border-border/50 flex items-center justify-center gap-4 text-muted-foreground">
                       <button className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-colors cursor-default" title="Email de contact">
                         <Mail className="w-3.5 h-3.5" />
                       </button>
                       <button className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-colors cursor-default" title="Téléphone">
                         <Phone className="w-3.5 h-3.5" />
                       </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
