import { getClubs, getMatches, getPlayersByClub } from "@/lib/api";
import { notFound } from "next/navigation";
import { MatchRow } from "@/components/MatchRow";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

const POSITION_STYLES: Record<string, string> = {
  Gardien: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Défenseur: 'bg-blue-100 text-blue-800 border-blue-200',
  Milieu: 'bg-purple-100 text-purple-800 border-purple-200',
  Attaquant: 'bg-red-100 text-red-800 border-red-200',
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params
  const clubs = await getClubs()
  const club = clubs.find(c => c.id === id)
  if (!club) return { title: 'Club introuvable' }
  return {
    title: club.name,
    description: `Retrouvez toutes les infos sur ${club.name} : effectif, calendrier et résultats. Ligue départementale de football d'Obala.`,
    openGraph: {
      title: club.name,
      description: `Fiche du club ${club.name} — Stade : ${club.stadium || 'Non renseigné'}`,
      type: 'website',
      ...(club.logo ? { images: [{ url: club.logo, width: 400, height: 400 }] } : {}),
    },
  }
}

export default async function ClubDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [clubs, matches, players] = await Promise.all([
    getClubs(),
    getMatches(),
    getPlayersByClub(id),
  ]);
  const club = clubs.find(c => c.id === id);

  if (!club) notFound();

  const clubMatches = matches
    .filter(m => m.homeTeamId === club.id || m.awayTeamId === club.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Group players by position
  const positions = ['Gardien', 'Défenseur', 'Milieu', 'Attaquant'] as const
  const playersByPosition = positions.map(pos => ({
    position: pos,
    players: players.filter(p => p.position === pos).sort((a, b) => a.number - b.number),
  })).filter(g => g.players.length > 0)

  return (
    <div className="container mx-auto px-4 py-12 flex-1">
      <Breadcrumbs items={[{ label: 'Clubs', href: '/clubs' }, { label: club.name }]} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mt-4">
        {/* Main Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="h-48 w-full bg-muted border border-border rounded-xl flex items-center justify-center p-6 relative overflow-hidden">
            {club.logo ? (
              <img src={club.logo} alt={club.name} className="absolute inset-0 w-full h-full object-contain p-4" />
            ) : (
              <span className="font-heading font-bold text-6xl text-muted-foreground">{club.name.substring(0, 2).toUpperCase()}</span>
            )}
          </div>

          <div>
            <h1 className="font-heading font-bold text-3xl uppercase tracking-tight text-foreground mb-4">{club.name}</h1>
            <div className="space-y-4 text-sm">
              <div>
                <span className="text-muted-foreground font-medium block">Stade</span>
                <span className="font-bold">{club.stadium || "Non renseigné"}</span>
              </div>

              {club.officials.length > 0 && (
                <div>
                  <span className="text-muted-foreground font-medium block mb-1">Direction</span>
                  <div className="flex flex-col gap-1 items-start">
                    {club.officials.map((o, idx) => (
                      <Badge key={idx} variant="secondary" className="w-max font-medium">{o}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="md:col-span-2 space-y-10">
          {/* Effectif */}
          {players.length > 0 && (
            <div>
              <h2 className="font-heading font-bold text-2xl uppercase tracking-tight text-foreground mb-6 border-b-2 border-primary inline-block pb-1">
                Effectif
              </h2>
              <div className="space-y-5">
                {playersByPosition.map(({ position, players: gp }) => (
                  <div key={position}>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs border ${POSITION_STYLES[position]}`}>{position}s</span>
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {gp.map(player => (
                        <Link key={player.id} href={`/joueurs/${player.id}`} className="group relative flex items-center gap-3 p-3 border border-border rounded-lg bg-card hover:border-primary/30 transition-colors">
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ExternalLink className="w-3 h-3 text-primary" />
                          </div>
                          <div className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center shrink-0 overflow-hidden">
                            {player.photoUrl ? (
                              <img src={player.photoUrl} alt={player.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xs font-bold text-muted-foreground">{player.name.substring(0, 2).toUpperCase()}</span>
                            )}
                          </div>
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="font-bold text-sm text-foreground truncate">{player.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground font-heading">#{player.number}</span>
                              {player.goals ? (
                                <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4 bg-primary/10 text-primary border-primary/20">
                                  {player.goals} {player.goals > 1 ? 'buts' : 'but'}
                                </Badge>
                              ) : null}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matches */}
          <div>
            <h2 className="font-heading font-bold text-2xl uppercase tracking-tight text-foreground mb-6 border-b-2 border-primary inline-block pb-1">
              Résultats &amp; Calendrier
            </h2>
            <div className="space-y-4">
              {clubMatches.length === 0 ? (
                <p className="text-muted-foreground text-sm">Aucun match disponible.</p>
              ) : (
                clubMatches.map(match => {
                  const home = clubs.find(c => c.id === match.homeTeamId);
                  const away = clubs.find(c => c.id === match.awayTeamId);
                  return <MatchRow key={match.id} match={match} homeTeam={home} awayTeam={away} />;
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
