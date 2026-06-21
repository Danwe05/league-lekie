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
  const upcomingMatches = matches.filter(m => m.status === 'UPCOMING').sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const finishedMatches = matches.filter(m => m.status === 'FINISHED').sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const featuredMatch = upcomingMatches[0] || finishedMatches[0];
  const featuredHomeTeam = featuredMatch ? clubs.find(c => c.id === featuredMatch.homeTeamId) : null;
  const featuredAwayTeam = featuredMatch ? clubs.find(c => c.id === featuredMatch.awayTeamId) : null;

  return (
    <main className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-20 px-4 text-center">
        <div className="container mx-auto">
          <h1 className="font-heading font-bold text-5xl md:text-7xl uppercase tracking-tighter mb-6">
            Ligue de la Lékié
          </h1>
          <p className="text-lg md:text-xl font-medium max-w-2xl mx-auto opacity-90 mb-10">
            Vivez la passion du football départemental. Suivez votre club, les résultats et l'actualité officielle.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/calendrier" className={`${buttonVariants({ size: "lg", variant: "secondary" })} font-bold border-none hover:bg-secondary/90`}>
              Voir le calendrier
            </Link>
            <Link href="/classement" className={`${buttonVariants({ size: "lg", variant: "outline" })} bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary font-bold`}>
              Classement complet
            </Link>
          </div>
        </div>
      </section>

      {/* Highlight Match & Mini Standings */}
      <section className="py-16 px-4 bg-background">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          
          {/* Left Col: Next/Last Match */}
          <div className="md:col-span-7 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-bold text-3xl uppercase tracking-tight text-foreground">
                À la Une
              </h2>
              <Link href="/calendrier" className="text-primary font-bold text-sm inline-flex items-center gap-1 hover:underline">
                Tous les matchs <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            {featuredMatch && featuredHomeTeam && featuredAwayTeam && (
              <ScoreBoard 
                homeTeam={featuredHomeTeam.name}
                awayTeam={featuredAwayTeam.name}
                homeScore={featuredMatch.homeScore}
                awayScore={featuredMatch.awayScore}
                status={featuredMatch.status}
                date={featuredMatch.date}
              />
            )}

            <div className="mt-4 flex flex-col gap-4">
              {upcomingMatches.slice(1, 3).map(match => {
                  const home = clubs.find(c => c.id === match.homeTeamId);
                  const away = clubs.find(c => c.id === match.awayTeamId);
                  return <MatchRow key={match.id} match={match} homeTeam={home} awayTeam={away} isCompact />;
              })}
            </div>
          </div>

          {/* Right Col: Mini standings */}
          <div className="md:col-span-5">
            <Card className="h-full border-border shadow-none rounded-xl">
              <CardHeader className="border-b border-border pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-heading font-bold text-2xl uppercase">Classement</CardTitle>
                  <Link href="/classement" className="text-primary font-bold text-sm hover:underline">
                    Voir tout
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50 text-muted-foreground font-medium text-left">
                        <th className="px-4 py-3 w-10 text-center">Pos</th>
                        <th className="px-4 py-3">Club</th>
                        <th className="px-4 py-3 w-10 text-center">Pts</th>
                        <th className="px-4 py-3 w-10 text-center">J</th>
                      </tr>
                    </thead>
                    <tbody>
                      {standings.map((row) => (
                        <tr key={row.clubId} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors group">
                          <td className="px-4 py-3 font-bold text-center text-muted-foreground">{row.position}</td>
                          <td className="px-4 py-3 font-bold text-foreground group-hover:text-primary transition-colors">
                            {row.clubName}
                          </td>
                          <td className="px-4 py-3 font-heading font-bold text-primary text-center text-lg">{row.points}</td>
                          <td className="px-4 py-3 text-center font-medium text-muted-foreground">{row.played}</td>
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
        <section className="py-12 px-4 bg-background border-t border-border">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading font-bold text-3xl uppercase tracking-tight text-foreground">
                Top Buteurs
              </h2>
              <Link href="/classement/buteurs" className="text-primary font-bold text-sm inline-flex items-center gap-1 hover:underline">
                Classement complet <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {topScorers.slice(0, 5).map((scorer, idx) => (
                <div key={scorer.playerId} className="border border-border rounded-xl bg-card p-4 text-center hover:border-primary/30 transition-colors">
                  <span className="text-xs font-bold text-muted-foreground block mb-2">{idx + 1}</span>
                  <span className="font-heading font-bold text-4xl text-primary block">{scorer.goals}</span>
                  <span className="font-bold text-sm text-foreground block mt-1 truncate">{scorer.playerName}</span>
                  <span className="text-xs text-muted-foreground truncate block">{scorer.clubName}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest News */}
      <section className="py-16 px-4 bg-muted border-t border-border">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-heading font-bold text-3xl uppercase tracking-tight text-foreground">
              Actualités
            </h2>
            <Link href="/actualites" className={`${buttonVariants({ variant: "outline" })} font-bold bg-transparent`}>
              Toutes les annonces
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {actualites.slice(0, 3).map(article => (
              <Card key={article.id} className="border-border shadow-none hover:border-primary transition-colors rounded-xl flex flex-col bg-card">
                <CardHeader>
                  <span className="text-xs font-bold text-muted-foreground mb-2">
                      {new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(article.date))}
                  </span>
                  <CardTitle className="font-heading text-xl leading-tight text-foreground group-hover:text-primary transition-colors">
                    {article.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-muted-foreground text-sm line-clamp-3 mb-6 flex-1">
                    {article.content}
                  </p>
                  <Link href={`/actualites#${article.id}`} className="text-primary font-bold text-sm tracking-wide uppercase inline-flex items-center gap-1 hover:underline">
                    Lire la suite <ArrowRight className="w-4 h-4" />
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
