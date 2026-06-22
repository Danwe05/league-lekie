import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-card text-foreground py-12 mt-16">
      <div className="container mx-auto px-4 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="font-heading font-bold text-xl text-primary mb-4">LIGUE LÉKIÉ</h3>
          <p className="text-muted-foreground text-sm">
            La ligue départementale de football d'Obala s'engage pour le développement du sport dans la Lékié.
          </p>
        </div>
        <div>
          <h4 className="font-bold text-sm mb-4">Compétitions</h4>
          <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
            <li><Link href="/calendrier" className="hover:text-primary">Matchs à venir</Link></li>
            <li><Link href="/classement" className="hover:text-primary">Classement officiel</Link></li>
            <li><Link href="/clubs" className="hover:text-primary">Clubs affiliés</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-sm mb-4">Administration</h4>
          <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
            <li><Link href="/actualites" className="hover:text-primary">Actualités</Link></li>
            <li><Link href="/bureau" className="hover:text-primary">Bureau Exécutif</Link></li>
            <li><Link href="/a-propos" className="hover:text-primary">Règlement intérieur</Link></li>
            <li><Link href="/contact" className="hover:text-primary">Nous contacter</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-sm mb-4">Contact</h4>
          <address className="text-sm text-muted-foreground not-italic flex flex-col gap-2">
            <p>Stade Municipal - Obala</p>
            <p>BP 123, Obala, Cameroun</p>
            <p>Tel: +237 696 66 51 90</p>
            <p>contact@liguelekie.cm</p>
          </address>
        </div>
      </div>
      <div className="container mx-auto px-4 lg:px-8 mt-12 pt-6 border-t border-muted text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Ligue Départementale de Football d'Obala. Tous droits réservés.
      </div>
    </footer>
  );
}
