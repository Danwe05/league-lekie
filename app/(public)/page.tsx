import { getClubs, getMatches, getActualites, getTopScorers } from "@/lib/api";
import { calculateStandings } from "@/lib/utils/standings";
import { MatchRow } from "@/components/MatchRow";
import { ScoreBoard } from "@/components/ScoreBoard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default async function Home() {
  const [clubs, matches, actualites, topScorers] = await Promise.all([
    getClubs(),
    getMatches(),
    getActualites(),
    getTopScorers(),
  ]);

  const standings = calculateStandings(clubs, matches).slice(0, 5); // Mini standings

  // Find the next upcoming match and the last finished match
  const liveMatches = matches.filter(m => m.status === 'LIVE');
  const upcomingMatches = matches.filter(m => m.status === 'UPCOMING').sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const finishedMatches = matches.filter(m => m.status === 'FINISHED').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const featuredMatch = upcomingMatches[0] || finishedMatches[0];
  const featuredHomeTeam = featuredMatch ? clubs.find(c => c.id === featuredMatch.homeTeamId) : null;
  const featuredAwayTeam = featuredMatch ? clubs.find(c => c.id === featuredMatch.awayTeamId) : null;

  return (
    <main className="flex-1 flex flex-col">
      {/* Hero Section — the one elevated moment on the page */}
      <section className="relative bg-primary text-primary-foreground py-28 md:py-44 px-4 text-center overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center z-0 scale-105"
          style={{ backgroundImage: "url('/hero-bg.png')" }}
        />
        {/* Single, controlled overlay for consistent legibility at every size */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/35 via-primary/65 to-primary/90 z-10" />

        <div className="container mx-auto relative z-20 animate-in fade-in slide-in-from-bottom-3 duration-700 ease-out">
          <h1 className="font-heading font-semibold text-5xl md:text-8xl tracking-tight leading-[1.04] mb-7 max-w-4xl mx-auto">
            Ligue départementale de football de la Lékié
          </h1>
          <p className="text-lg md:text-xl font-normal max-w-xl mx-auto text-primary-foreground/85 leading-relaxed mb-12">
            Vivez la passion du football départemental. Suivez votre club, les résultats et l'actualité officielle.
          </p>
          <div className="flex justify-center flex-wrap gap-3">
            <Link
              href="/calendrier"
              className={`${buttonVariants({ size: "lg", variant: "secondary" })} font-semibold border-none shadow-lg shadow-black/10 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 ease-out`}
            >
              Voir le calendrier
            </Link>
            <Link
              href="/classement"
              className={`${buttonVariants({ size: "lg", variant: "outline" })} bg-white/10 border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground hover:text-primary font-semibold backdrop-blur-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 ease-out`}
            >
              Classement complet
            </Link>
          </div>
        </div>
      </section>

      {/* Live Matches — floating glass capsule instead of a full-bleed strip */}
      {liveMatches.length > 0 && (
        <div className="sticky top-16 z-40 px-4 pt-4">
          <section className="container mx-auto max-w-4xl bg-red-600/95 backdrop-blur-xl text-white rounded-2xl px-5 py-3.5 shadow-[0_8px_30px_rgba(220,38,38,0.28)] animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="flex flex-col md:flex-row items-center gap-3 justify-center md:justify-between">
              <div className="flex items-center gap-2.5 shrink-0">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                </span>
                <h2 className="font-heading font-semibold text-sm uppercase tracking-[0.15em] text-white m-0 leading-none">
                  En direct
                </h2>
              </div>

              <div className="flex gap-3 overflow-x-auto snap-x hide-scrollbar max-w-full">
                {liveMatches.map(match => {
                  const home = clubs.find(c => c.id === match.homeTeamId);
                  const away = clubs.find(c => c.id === match.awayTeamId);
                  return (
                    <Link key={match.id} href="/calendrier" className="flex items-center gap-3 bg-white/10 hover:bg-white/20 transition-colors duration-200 rounded-xl px-3.5 py-1.5 shrink-0 snap-center min-w-[260px]">
                      <span className="font-semibold text-sm truncate text-right flex-1">{home?.name}</span>
                      <div className="bg-white text-red-600 px-2.5 py-0.5 rounded-full font-heading font-bold text-sm leading-none tabular-nums min-w-[2.75rem] text-center shrink-0">
                        {match.homeScore ?? 0} - {match.awayScore ?? 0}
                      </div>
                      <span className="font-semibold text-sm truncate text-left flex-1">{away?.name}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Highlight Match & Mini Standings */}
      <section className="py-20 md:py-28 px-4 bg-background">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16">

          {/* Left Col: Next/Last Match */}
          <div className="md:col-span-7 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-semibold text-3xl md:text-4xl tracking-tight text-foreground">
                À la Une
              </h2>
              <Link href="/calendrier" className="group text-primary font-semibold text-sm inline-flex items-center gap-1 hover:underline">
                Tous les matchs <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>

            {featuredMatch && featuredHomeTeam && featuredAwayTeam && (
              <div className="rounded-2xl overflow-hidden border border-border shadow-sm">
                <ScoreBoard
                  homeTeam={featuredHomeTeam.name}
                  awayTeam={featuredAwayTeam.name}
                  homeScore={featuredMatch.homeScore}
                  awayScore={featuredMatch.awayScore}
                  status={featuredMatch.status}
                  date={featuredMatch.date}
                />
              </div>
            )}

            <div className="mt-2 flex flex-col gap-3">
              {upcomingMatches.slice(1, 3).map(match => {
                const home = clubs.find(c => c.id === match.homeTeamId);
                const away = clubs.find(c => c.id === match.awayTeamId);
                return <MatchRow key={match.id} match={match} homeTeam={home} awayTeam={away} isCompact />;
              })}
            </div>
          </div>

          {/* Right Col: Mini standings */}
          <div className="md:col-span-5">
            <Card className="h-full border-border shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-border pb-5">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-heading font-semibold text-2xl tracking-tight">Classement</CardTitle>
                  <Link href="/classement" className="text-primary font-semibold text-sm hover:underline">
                    Voir tout
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50 text-muted-foreground font-medium text-left">
                        <th className="px-5 py-3.5 w-10 text-center">Pos</th>
                        <th className="px-5 py-3.5">Club</th>
                        <th className="px-5 py-3.5 w-10 text-center">Pts</th>
                        <th className="px-5 py-3.5 w-10 text-center">J</th>
                      </tr>
                    </thead>
                    <tbody>
                      {standings.map((row) => (
                        <tr
                          key={row.clubId}
                          className={`border-b border-border last:border-0 hover:bg-muted/40 transition-colors duration-200 group ${row.position <= 3 ? "bg-primary/[0.03]" : ""}`}
                        >
                          <td className="px-5 py-4 font-semibold text-center text-muted-foreground tabular-nums">{row.position}</td>
                          <td className="px-5 py-4 font-semibold text-foreground group-hover:text-primary transition-colors duration-200">
                            {row.clubName}
                          </td>
                          <td className="px-5 py-4 font-heading font-bold text-primary text-center text-lg tabular-nums">{row.points}</td>
                          <td className="px-5 py-4 text-center font-medium text-muted-foreground tabular-nums">{row.played}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Top Scorers Mini Widget */}
      {topScorers.length > 0 && (
        <section className="py-16 md:py-20 px-4 bg-background border-t border-border">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-heading font-semibold text-3xl md:text-4xl tracking-tight text-foreground">
                Top Buteurs
              </h2>
              <Link href="/classement/buteurs" className="group text-primary font-semibold text-sm inline-flex items-center gap-1 hover:underline">
                Classement complet <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {topScorers.slice(0, 5).map((scorer, idx) => (
                <Link
                  key={scorer.playerId}
                  href={`/joueurs/${scorer.playerId}`}
                  className="group border border-border rounded-2xl bg-card p-5 text-center hover:border-primary/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out flex flex-col items-center"
                >
                  <span className="text-xs font-semibold text-muted-foreground/70 tracking-wide block mb-3">#{idx + 1}</span>
                  {/* Avatar */}
                  <div className="w-20 h-20 rounded-full bg-muted ring-1 ring-border group-hover:ring-primary/30 flex items-center justify-center overflow-hidden shrink-0 mb-4 transition-all duration-300">
                    {scorer.photoUrl ? (
                      <img src={scorer.photoUrl} alt={scorer.playerName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl font-semibold text-muted-foreground">
                        {scorer.playerName.substring(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="font-heading font-bold text-4xl text-primary block tabular-nums">{scorer.goals}</span>
                  <span className="font-semibold text-sm text-foreground block mt-1.5 truncate w-full group-hover:text-primary transition-colors duration-200">{scorer.playerName}</span>
                  <span className="text-xs text-muted-foreground truncate block w-full">{scorer.clubName}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Direction Section */}
      <section className="py-24 md:py-32 px-4 bg-muted border-t border-border relative overflow-hidden">
        {/* Subtle decorative background gradient */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />
        
        <div className="container mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="font-heading font-semibold text-4xl md:text-5xl tracking-tight text-foreground mb-6">
              Mot de la Direction
            </h2>
            <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
              La Ligue départementale de la Lékié bénéficie de l'appui et de la supervision des instances dirigeantes du football camerounais.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14 max-w-5xl mx-auto">
            {/* FECAFOOT President */}
            <div className="group rounded-[2rem] md:rounded-[3rem] bg-card border border-border/60 overflow-hidden shadow-sm hover:shadow-2xl hover:border-primary/30 transition-all duration-500 ease-out flex flex-col">
              {/* Big Photo */}
              <div className="w-full aspect-[4/3] md:aspect-[4/5] relative bg-muted overflow-hidden">
                <img 
                  src="/photo-president-fecafoot.jpg" 
                  alt="Samuel Eto'o Fils" 
                  className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105" 
                />
                {/* Refined gradient bridge */}
                <div className="absolute inset-x-0 bottom-0 h-24 sm:h-32 bg-gradient-to-t from-card to-transparent pointer-events-none" />
              </div>
              
              {/* Info Frame */}
              <div className="px-6 sm:px-8 pb-10 flex-1 flex flex-col items-center text-center -mt-8 sm:-mt-10 z-10 relative">
                <h3 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-1.5 md:mb-2 drop-shadow-sm">Samuel Eto'o Fils</h3>
                <p className="font-semibold text-primary/90 uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[10px] sm:text-xs md:text-sm mb-8 z-10 relative bg-card px-2">Président de la FECAFOOT</p>
                
                <div className="bg-muted/30 p-6 md:p-8 rounded-2xl border border-border/50 relative mt-auto w-full group-hover:bg-muted/50 transition-colors duration-500">
                  <span className="text-4xl sm:text-6xl text-primary/10 absolute -top-2 sm:-top-4 left-0 sm:-left-2 font-serif font-black leading-none">"</span>
                  <p className="text-muted-foreground text-sm md:text-base leading-relaxed italic relative z-10 px-2 sm:px-4">
                    Redonner au football camerounais toute sa grandeur commence par nos ligues départementales. La Lékié est un vivier de talents que la Fecafoot est fière d'accompagner.
                  </p>
                </div>
              </div>
            </div>

            {/* League President */}
            <div className="group rounded-[2rem] md:rounded-[3rem] bg-card border border-border/60 overflow-hidden shadow-sm hover:shadow-2xl hover:border-primary/30 transition-all duration-500 ease-out flex flex-col">
              {/* Big Photo */}
              <div className="w-full aspect-[4/3] md:aspect-[4/5] relative bg-muted overflow-hidden flex items-center justify-center">
                <img 
                  src="/photo-president-ligue.jpg" 
                  alt="Nomo Awono François Janvier" 
                  className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105 absolute inset-0 z-10" 
                />
                <span className="font-bold text-muted-foreground text-sm uppercase text-center absolute z-0 px-4" aria-hidden="true">Photo (non disponible)</span>
                {/* Refined gradient bridge */}
                <div className="absolute inset-x-0 bottom-0 h-24 sm:h-32 bg-gradient-to-t from-card to-transparent pointer-events-none z-20" />
              </div>
              
              {/* Info Frame */}
              <div className="px-6 sm:px-8 pb-10 flex-1 flex flex-col items-center text-center -mt-8 sm:-mt-10 z-30 relative">
                <h3 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-1.5 md:mb-2 drop-shadow-sm">Nomo Awono F. Janvier</h3>
                <p className="font-semibold text-primary/90 uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[10px] sm:text-xs md:text-sm mb-8 z-10 relative bg-card px-2">Président de la Ligue Dép.</p>
                
                <div className="bg-muted/30 p-6 md:p-8 rounded-2xl border border-border/50 relative mt-auto w-full group-hover:bg-muted/50 transition-colors duration-500">
                  <span className="text-4xl sm:text-6xl text-primary/10 absolute -top-2 sm:-top-4 left-0 sm:-left-2 font-serif font-black leading-none">"</span>
                  <p className="text-muted-foreground text-sm md:text-base leading-relaxed italic relative z-10 px-2 sm:px-4">
                    Notre mission est d'organiser un championnat compétitif, transparent et moderne. Bienvenue dans la vitrine du football de la Lékié.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest News */}
      <section className="py-20 md:py-28 px-4 bg-background border-t border-border">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-10">
            <h2 className="font-heading font-semibold text-3xl md:text-4xl tracking-tight text-foreground">
              Actualités
            </h2>
            <Link href="/actualites" className={`${buttonVariants({ variant: "outline" })} font-semibold bg-background hover:bg-background/80`}>
              Toutes les annonces
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {actualites.slice(0, 3).map(article => (
              <Card
                key={article.id}
                className="group border-border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out rounded-2xl flex flex-col bg-card overflow-hidden"
              >
                <CardHeader>
                  <span className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-[0.1em] mb-2">
                    {new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(article.date))}
                  </span>
                  <CardTitle className="font-heading text-xl leading-snug text-foreground group-hover:text-primary transition-colors duration-200">
                    {article.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 mb-6 flex-1">
                    {article.content}
                  </p>
                  <Link href={`/actualites/${article.id}`} className="text-primary font-semibold text-sm tracking-wide uppercase inline-flex items-center gap-1">
                    Lire la suite <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}