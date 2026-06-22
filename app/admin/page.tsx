import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getClubs, getMatches, getActualites } from '@/lib/api';
import { Users, CalendarDays, Newspaper, Activity } from 'lucide-react';
import Link from 'next/link';
import { MatchRow } from '@/components/MatchRow';

import { calculateStandings } from '@/lib/utils/standings';

export default async function AdminDashboardPage() {
  const [clubs, matches, actualites] = await Promise.all([
    getClubs(),
    getMatches(),
    getActualites()
  ]);

  const upcomingMatches = matches.filter(m => m.status === 'UPCOMING');
  
  // Computed Stats
  const totalGoals = matches.reduce((acc, m) => acc + (m.homeScore || 0) + (m.awayScore || 0), 0);
  const standings = calculateStandings(clubs, matches);
  const leadingClub = standings.length > 0 ? standings[0] : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading font-bold text-3xl mb-2">Vue d'ensemble</h1>
        <p className="text-muted-foreground">Bienvenue sur le panneau d'administration de la ligue.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Clubs Affiliés</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clubs.length}</div>
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Matchs Effectués</CardTitle>
            <CalendarDays className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{matches.filter(m => m.status === 'FINISHED').length}</div>
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Buts Marqués</CardTitle>
            <Activity className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalGoals}</div>
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Leader actuel</CardTitle>
            <Newspaper className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate">
              {leadingClub ? leadingClub.clubName : '-'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions / Export */}
      <Card className="shadow-none border-border bg-muted/20">
        <CardContent className="p-4 flex items-center gap-4 flex-wrap">
          <span className="text-sm font-bold text-muted-foreground mr-2">Exports :</span>
          <a
            href="/admin/export?type=standings"
            className="inline-flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-md text-sm font-bold shadow-sm hover:bg-muted transition-colors"
          >
            Télécharger Classement (CSV)
          </a>
          <a
            href="/admin/export?type=scorers"
            className="inline-flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-md text-sm font-bold shadow-sm hover:bg-muted transition-colors"
          >
            Télécharger Buteurs (CSV)
          </a>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-none border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-heading text-xl">Prochains Matchs</CardTitle>
            <Link href="/admin/matchs" className="text-sm text-primary font-bold hover:underline">Gérer →</Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingMatches.slice(0, 3).map(match => {
              const home = clubs.find(c => c.id === match.homeTeamId);
              const away = clubs.find(c => c.id === match.awayTeamId);
              return <MatchRow key={match.id} match={match} homeTeam={home} awayTeam={away} isCompact />;
            })}
            {upcomingMatches.length === 0 && <p className="text-muted-foreground text-sm">Aucun match à venir.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
