import { getClubs, getMatches } from "@/lib/api";
import { notFound } from "next/navigation";
import { ScoreBoard } from "@/components/ScoreBoard";
import { MatchEvent, MatchEventType } from "@/lib/types";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ShareButton } from "@/components/ShareButton";
import Link from "next/link";
import { Clock, Download, ArrowRightLeft, Handshake, ShieldAlert } from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params
  const [clubs, matches] = await Promise.all([getClubs(), getMatches()])
  const match = matches.find(m => m.id === id)
  if (!match) return { title: 'Match introuvable' }
  const home = clubs.find(c => c.id === match.homeTeamId)
  const away = clubs.find(c => c.id === match.awayTeamId)
  const title = `${home?.name} vs ${away?.name}`
  return {
    title,
    description: `Revivez le match ${title} - Timeline complète, buts, cartons, remplacements.`,
  }
}

const EVENT_ICONS: Record<MatchEventType | 'GOAL', React.ReactNode> = {
  GOAL: <span className="text-xl leading-none">⚽</span>,
  YELLOW_CARD: <span className="text-xl leading-none" title="Carton Jaune">🟨</span>,
  RED_CARD: <span className="text-xl leading-none" title="Carton Rouge">🟥</span>,
  SUB_IN: <span title="Entrée"><ArrowRightLeft className="w-5 h-5 text-green-500" /></span>,
  SUB_OUT: <span title="Sortie"><ArrowRightLeft className="w-5 h-5 text-red-500" /></span>,
  ASSIST: <span title="Passe décisive"><Handshake className="w-5 h-5 text-blue-500" /></span>,
  MOTM: <span className="text-xl leading-none" title="Homme du match">⭐</span>,
};

export default async function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [clubs, matches] = await Promise.all([getClubs(), getMatches()]);
  const match = matches.find(m => m.id === id);

  if (!match) notFound();

  const homeTeam = clubs.find(c => c.id === match.homeTeamId);
  const awayTeam = clubs.find(c => c.id === match.awayTeamId);

  if (!homeTeam || !awayTeam) notFound();

  // Combine goals and events into a single sorted timeline
  const allEvents = [
    ...(match.goals?.map(g => ({ ...g, isGoal: true, renderType: 'GOAL' as const })) || []),
    ...(match.events?.map(e => ({ ...e, isGoal: false, renderType: e.type })) || [])
  ].sort((a, b) => (a.minute || 0) - (b.minute || 0));

  // Determine which side the event is on (Home = left, Away = right)
  const isHomeEvent = (clubId: string) => clubId === homeTeam.id;

  return (
    <div className="container mx-auto px-4 py-8 flex-1 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <Breadcrumbs items={[
          { label: 'Calendrier', href: '/calendrier' }, 
          { label: `${homeTeam.name} vs ${awayTeam.name}` }
        ]} />
        <ShareButton title={`Match ${homeTeam.name} vs ${awayTeam.name} - Ligue Lékié`} />
      </div>

      <div className="mb-12">
        <ScoreBoard 
          homeTeam={homeTeam.name} 
          awayTeam={awayTeam.name} 
          homeScore={match.homeScore} 
          awayScore={match.awayScore} 
          status={match.status} 
          date={match.date} 
        />
      </div>

      <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-sm">
        <h2 className="font-heading font-bold text-2xl uppercase text-center mb-8 flex items-center justify-center gap-2">
          <Clock className="w-6 h-6 text-primary" /> Film du match
        </h2>

        {allEvents.length === 0 ? (
          <p className="text-center text-muted-foreground py-10">Aucun événement enregistré pour ce match pour le moment.</p>
        ) : (
          <div className="relative">
            {/* Center line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2 hidden md:block"></div>
            
            <div className="space-y-6 relative">
              {allEvents.map((ev, idx) => {
                const isHome = isHomeEvent(ev.clubId);
                return (
                  <div key={`${ev.id}-${idx}`} className={`flex flex-col md:flex-row items-center justify-between w-full ${isHome ? 'md:flex-row-reverse' : ''}`}>
                    
                    {/* Empty Space for the other side on Desktop */}
                    <div className="hidden md:block md:w-5/12"></div>
                    
                    {/* Event Icon / Minute (Center on Desktop) */}
                    <div className="md:w-2/12 flex flex-col items-center justify-center z-10 shrink-0 my-2 md:my-0">
                      <div className="bg-background border-2 border-primary/20 w-12 h-12 rounded-full flex items-center justify-center shadow-sm">
                         {EVENT_ICONS[ev.renderType] || EVENT_ICONS['GOAL']}
                      </div>
                      {ev.minute && <span className="font-bold text-sm text-foreground mt-1">{ev.minute}'</span>}
                    </div>
                    
                    {/* Content Card */}
                    <div className="w-full md:w-5/12">
                      <div className={`p-4 rounded-xl border border-border bg-muted/30 flex items-center gap-3 ${isHome ? 'md:justify-end' : 'md:justify-start'}`}>
                        {/* Club indicator strictly on mobile or aligned */}
                        <div className={`flex items-center gap-3 w-full ${isHome ? 'justify-end text-right' : 'justify-start text-left'}`}>
                          {/* If not home, text on left -> image on left */}
                          {!isHome && (
                            <div className="w-8 h-8 rounded-full bg-background border hidden sm:flex items-center justify-center shrink-0">
                               {awayTeam.logo ? <img src={awayTeam.logo} alt="Away" className="w-6 h-6 object-contain" /> : null}
                            </div>
                          )}
                          
                          <div className="flex flex-col">
                            <Link href={`/joueurs/${ev.playerId}`} className="font-bold text-foreground hover:text-primary hover:underline transition-colors mt-0.5">
                              {ev.playerName}
                            </Link>
                            <span className="text-xs text-muted-foreground uppercase tracking-wide">
                              {ev.renderType === 'GOAL' ? 'But' : 
                               ev.renderType === 'YELLOW_CARD' ? 'Avertissement' : 
                               ev.renderType === 'RED_CARD' ? 'Expulsion' : 
                               ev.renderType === 'ASSIST' ? 'Passe décisive' : 
                               ev.renderType === 'SUB_IN' ? 'Entrée' : 
                               ev.renderType === 'SUB_OUT' ? 'Sortie' : 'Homme du Match'}
                            </span>
                          </div>

                          {/* If home, text on right -> image on right */}
                          {isHome && (
                            <div className="w-8 h-8 rounded-full bg-background border hidden sm:flex items-center justify-center shrink-0">
                               {homeTeam.logo ? <img src={homeTeam.logo} alt="Home" className="w-6 h-6 object-contain" /> : null}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
