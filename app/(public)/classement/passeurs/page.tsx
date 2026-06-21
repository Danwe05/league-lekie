import { getClubs, getMatches, getPlayersByClub } from "@/lib/api"
import { Trophy, Users } from "lucide-react"
import { StandingsNav } from "@/components/StandingsNav"
import { Player } from "@/lib/types"
import Link from "next/link"

export const metadata = {
  title: 'Meilleurs Passeurs | Ligue Lékié',
  description: 'Classement des meilleurs passeurs de la saison en cours de la Ligue Départementale de Football d\'Obala.'
}

export default async function TopAssistsPage() {
  const [clubs, matches] = await Promise.all([getClubs(), getMatches()])
  
  // Flatten players
  const allPlayers: Player[] = []
  for (const c of clubs) {
    const pts = await getPlayersByClub(c.id)
    allPlayers.push(...pts)
  }

  const assistCounts: Record<string, number> = {}

  matches.forEach(m => {
    (m.events || []).forEach(ev => {
      if (ev.type === 'ASSIST') {
        assistCounts[ev.playerId] = (assistCounts[ev.playerId] || 0) + 1
      }
    })
  })

  const topAssists = Object.entries(assistCounts)
    .map(([playerId, count]) => {
      const p = allPlayers.find(x => x.id === playerId)
      return {
        playerId,
        playerName: p?.name || 'Inconnu',
        clubName: clubs.find(c => c.id === p?.clubId)?.name || 'Inconnu',
        count
      }
    })
    .sort((a, b) => b.count - a.count)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-3xl mb-1 flex items-center gap-2">
            <Users className="w-7 h-7 text-primary" /> Meilleurs Passeurs
          </h1>
          <p className="text-muted-foreground text-sm">Ceux qui offrent les caviars.</p>
        </div>
        <StandingsNav />
      </div>

      <div className="bg-card border border-border shadow-sm rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-border text-muted-foreground bg-muted/30">
              <th className="py-4 pl-6 text-left w-16 font-bold uppercase tracking-wider text-xs">Rang</th>
              <th className="py-4 text-left font-bold uppercase tracking-wider text-xs">Joueur</th>
              <th className="py-4 text-left font-bold uppercase tracking-wider text-xs hidden sm:table-cell">Club</th>
              <th className="py-4 pr-6 text-right font-bold uppercase tracking-wider text-xs">Passes Déc.</th>
            </tr>
          </thead>
          <tbody>
            {topAssists.map((stat, idx) => (
              <tr key={stat.playerId} className={`border-b border-border hover:bg-muted/10 transition-colors ${idx < 3 ? 'bg-primary/5' : ''}`}>
                <td className="py-4 pl-6 font-bold text-muted-foreground">
                   {idx === 0 ? <span className="text-yellow-500 text-lg sm:text-xl">🥇</span> : 
                    idx === 1 ? <span className="text-gray-400 text-lg sm:text-xl">🥈</span> : 
                    idx === 2 ? <span className="text-amber-600 text-lg sm:text-xl">🥉</span> : 
                    idx + 1}
                </td>
                <td className="py-4 font-bold text-base">
                  <Link href={`/joueurs/${stat.playerId}`} className="hover:text-primary hover:underline transition-colors">
                    {stat.playerName}
                  </Link>
                </td>
                <td className="py-4 text-muted-foreground hidden sm:table-cell">{stat.clubName}</td>
                <td className="py-4 pr-6 text-right font-heading font-bold text-xl text-primary">{stat.count}</td>
              </tr>
            ))}
            {topAssists.length === 0 && (
              <tr>
                <td colSpan={4} className="py-12 text-center text-muted-foreground">
                  Aucune passe décisive enregistrée pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
