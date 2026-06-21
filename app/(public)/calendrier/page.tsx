import { getMatches, getClubs, getSeasons } from "@/lib/api";
import { MatchRow } from "@/components/MatchRow";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SeasonSelector } from "@/components/SeasonSelector";

export default async function CalendrierPage({
  searchParams,
}: {
  searchParams: Promise<{ season?: string }>
}) {
  const { season } = await searchParams
  const [matches, clubs, seasons] = await Promise.all([
    getMatches(season),
    getClubs(),
    getSeasons(),
  ]);

  const upcomingMatches = matches
    .filter(m => m.status === 'UPCOMING')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const finishedMatches = matches
    .filter(m => m.status === 'FINISHED')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const liveMatches = matches.filter(m => m.status === 'LIVE');

  return (
    <div className="container mx-auto px-4 py-12 flex-1">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
        <h1 className="font-heading font-bold text-4xl uppercase tracking-tighter border-b-4 border-primary inline-block pb-2">
          Calendrier &amp; Résultats
        </h1>
        <SeasonSelector seasons={seasons} currentSeason={season} />
      </div>

      {/* Live matches banner */}
      {liveMatches.length > 0 && (
        <div className="mb-6 flex flex-col gap-4">
          <p className="text-sm font-bold text-green-700 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse inline-block" />
            En ce moment
          </p>
          {liveMatches.map(match => {
            const home = clubs.find(c => c.id === match.homeTeamId);
            const away = clubs.find(c => c.id === match.awayTeamId);
            return <MatchRow key={match.id} match={match} homeTeam={home} awayTeam={away} />;
          })}
        </div>
      )}

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="mb-8 p-1 bg-muted rounded-lg">
          <TabsTrigger value="upcoming" className="font-bold">À venir</TabsTrigger>
          <TabsTrigger value="results" className="font-bold">Résultats</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="flex flex-col gap-4">
          {upcomingMatches.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">Aucun match programmé pour le moment.</p>
          ) : (
            upcomingMatches.map(match => {
              const home = clubs.find(c => c.id === match.homeTeamId);
              const away = clubs.find(c => c.id === match.awayTeamId);
              return <MatchRow key={match.id} match={match} homeTeam={home} awayTeam={away} />;
            })
          )}
        </TabsContent>
        <TabsContent value="results" className="flex flex-col gap-4">
          {finishedMatches.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">Aucun résultat disponible pour le moment.</p>
          ) : (
            finishedMatches.map(match => {
              const home = clubs.find(c => c.id === match.homeTeamId);
              const away = clubs.find(c => c.id === match.awayTeamId);
              return <MatchRow key={match.id} match={match} homeTeam={home} awayTeam={away} />;
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
