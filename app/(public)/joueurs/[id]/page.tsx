import { getClubs, getPlayersByClub, getMatches } from "@/lib/api";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { UserSquare, CalendarDays, Target, ShieldAlert } from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const clubs = await getClubs();
  // Fetch all players to find the one we need across all clubs
  // (In a real app with direct DB queries, we'd query by player ID, but getPlayersByClub is grouped by club)
  let foundPlayer = null;
  let playerClub = null;
  for (const c of clubs) {
    const players = await getPlayersByClub(c.id);
    const p = players.find(x => x.id === id);
    if (p) {
      foundPlayer = p;
      playerClub = c;
      break;
    }
  }

  if (!foundPlayer) return { title: 'Joueur introuvable' }

  return {
    title: `${foundPlayer.name} — ${playerClub?.name}`,
    description: `Fiche détaillée du joueur ${foundPlayer.name} évoluant au poste de ${foundPlayer.position} pour ${playerClub?.name}.`,
    openGraph: {
      title: `${foundPlayer.name} | Ligue Lékié`,
      description: `Profil de ${foundPlayer.name} - Numéro ${foundPlayer.number}`,
      type: 'profile',
      ...(foundPlayer.photoUrl ? { images: [{ url: foundPlayer.photoUrl, width: 400, height: 400 }] } : {}),
    },
  }
}

export default async function JoueurDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [clubs, matches] = await Promise.all([getClubs(), getMatches()]);
  
  let player = null;
  let club = null;
  for (const c of clubs) {
    const players = await getPlayersByClub(c.id);
    const p = players.find(x => x.id === id);
    if (p) {
      player = p;
      club = c;
      break;
    }
  }

  if (!player || !club) notFound();

  // Aggregate stats from matches
  // A match event contains goals and match_events.
  let goalsCount = 0;
  let yellowCards = 0;
  let redCards = 0;
  let assistCount = 0;
  let subInCount = 0;
  let motmCount = 0;

  matches.forEach(m => {
    (m.goals || []).forEach(g => {
      if (g.playerId === id) goalsCount++;
    });
    (m.events || []).forEach(e => {
      if (e.playerId === id) {
        if (e.type === 'YELLOW_CARD') yellowCards++;
        if (e.type === 'RED_CARD') redCards++;
        if (e.type === 'ASSIST') assistCount++;
        if (e.type === 'SUB_IN') subInCount++;
        if (e.type === 'MOTM') motmCount++;
      }
    });
  });

  const POSITION_COLORS: Record<string, string> = {
    Gardien: 'text-yellow-600 bg-yellow-100',
    Défenseur: 'text-blue-600 bg-blue-100',
    Milieu: 'text-purple-600 bg-purple-100',
    Attaquant: 'text-red-600 bg-red-100',
  }

  return (
    <div className="container mx-auto px-4 py-8 flex-1 max-w-5xl">
      <Breadcrumbs items={[
        { label: 'Clubs', href: '/clubs' }, 
        { label: club.name, href: `/clubs/${club.id}` },
        { label: player.name }
      ]} />

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sidebar Profile Card */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm relative">
            {/* Header pattern banner */}
            <div className="h-24 bg-primary relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-20" />
            </div>
            
            {/* Avatar */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2">
              <div className="w-32 h-32 rounded-full border-4 border-card bg-muted flex items-center justify-center overflow-hidden shadow-md">
                {player.photoUrl ? (
                  <img src={player.photoUrl} alt={player.name} className="w-full h-full object-cover" />
                ) : (
                  <UserSquare className="w-16 h-16 text-muted-foreground" />
                )}
              </div>
            </div>

            <div className="pt-20 px-6 pb-8 text-center flex flex-col items-center">
              <h1 className="font-heading font-bold text-3xl uppercase tracking-tight text-foreground">{player.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${POSITION_COLORS[player.position] || 'bg-muted text-muted-foreground'}`}>
                  {player.position}
                </span>
                <span className="font-heading font-bold text-muted-foreground border border-border px-2 py-0.5 rounded text-sm">
                  #{player.number}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="font-heading font-bold text-lg mb-4 text-primary">Informations</h3>
            <ul className="space-y-4">
              <li className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm font-medium">Club Actuel</span>
                <span className="font-bold">{club.name}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm font-medium">Saison</span>
                <span className="font-bold">{player.season}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Main Content (Stats & History) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
            <h2 className="font-heading font-bold text-2xl uppercase mb-6 flex items-center gap-2">
              <Target className="w-6 h-6 text-primary" /> Statistiques de la saison
            </h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="border border-border bg-muted/30 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                <span className="text-3xl lg:text-4xl leading-none">⚽</span>
                <span className="font-heading font-bold text-3xl text-foreground mt-2">{goalsCount}</span>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">Buts</span>
              </div>

              <div className="border border-border bg-muted/30 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                <span className="text-3xl lg:text-4xl leading-none">🤝</span>
                <span className="font-heading font-bold text-3xl text-foreground mt-2">{assistCount}</span>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">Passes Déc.</span>
              </div>

              <div className="border border-border bg-muted/30 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                <span className="text-3xl lg:text-4xl leading-none">⭐</span>
                <span className="font-heading font-bold text-3xl text-foreground mt-2">{motmCount}</span>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">H. Du Match</span>
              </div>
              
              <div className="border border-border bg-muted/30 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                <span className="text-3xl lg:text-4xl leading-none">⬆️</span>
                <span className="font-heading font-bold text-3xl text-foreground mt-2">{subInCount}</span>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">Entrées</span>
              </div>

              <div className="border border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                <span className="text-3xl lg:text-4xl leading-none">🟨</span>
                <span className="font-heading font-bold text-3xl text-yellow-600 mt-2">{yellowCards}</span>
                <span className="text-xs font-bold text-yellow-600/70 uppercase tracking-wider mt-1">Avertissements</span>
              </div>

              <div className="border border-red-200 bg-red-50 dark:bg-red-950/20 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                <span className="text-3xl lg:text-4xl leading-none">🟥</span>
                <span className="font-heading font-bold text-3xl text-red-600 mt-2">{redCards}</span>
                <span className="text-xs font-bold text-red-600/70 uppercase tracking-wider mt-1">Expulsions</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
