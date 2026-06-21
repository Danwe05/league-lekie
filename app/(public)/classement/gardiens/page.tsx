import { getClubs, getMatches, getPlayersByClub } from "@/lib/api"
import { ShieldAlert } from "lucide-react"
import { StandingsNav } from "@/components/StandingsNav"
import { Player } from "@/lib/types"
import Link from "next/link"

export const metadata = {
  title: 'Gants d\'Or (Gardiens) | Ligue Lékié',
  description: 'Classement des gardiens ayant réalisé le plus de clean sheets (matchs sans encaisser de buts).'
}

export default async function TopGardiensPage() {
  const [clubs, matches] = await Promise.all([getClubs(), getMatches()])
  
  // Flatten players
  const allPlayers: Player[] = []
  for (const c of clubs) {
    const pts = await getPlayersByClub(c.id)
    allPlayers.push(...pts)
  }

  // Filter only goalkeepers
  const goalkeepers = allPlayers.filter(p => p.position === 'Gardien')

  const cleanSheets: Record<string, number> = {}

  goalkeepers.forEach(gk => {
    cleanSheets[gk.id] = 0
    matches.forEach(m => {
      // Must be finished
      if (m.status !== 'FINISHED' || m.homeScore === undefined || m.awayScore === undefined) return;
      
      // If the GK's team is Home, they get a clean sheet if awayScore === 0
      if (m.homeTeamId === gk.clubId && m.awayScore === 0) {
        cleanSheets[gk.id] += 1
      }
      // If the GK's team is Away, they get a clean sheet if homeScore === 0
      if (m.awayTeamId === gk.clubId && m.homeScore === 0) {
        cleanSheets[gk.id] += 1
      }
    })
  })

  const topGardiens = Object.entries(cleanSheets)
    .filter(([_, count]) => count > 0) // Only those with at least 1 clean sheet
    .map(([playerId, count]) => {
      const p = goalkeepers.find(x => x.id === playerId)
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
            <ShieldAlert className="w-7 h-7 text-primary" /> Gants d'Or
          </h1>
          <p className="text-muted-foreground text-sm">Les murailles du championnat (Clean Sheets).</p>
        </div>
        <StandingsNav />
      </div>

      <div className="bg-card border border-border shadow-sm rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-border text-muted-foreground bg-muted/30">
              <th className="py-4 pl-6 text-left w-16 font-bold uppercase tracking-wider text-xs">Rang</th>
              <th className="py-4 text-left font-bold uppercase tracking-wider text-xs">Gardien</th>
              <th className="py-4 text-left font-bold uppercase tracking-wider text-xs hidden sm:table-cell">Club</th>
              <th className="py-4 pr-6 text-right font-bold uppercase tracking-wider text-xs">Invincibilité</th>
            </tr>
          </thead>
          <tbody>
            {topGardiens.map((stat, idx) => (
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
                <td className="py-4 pr-6 text-right font-heading font-bold text-xl text-primary">{stat.count} CS</td>
              </tr>
            ))}
            {topGardiens.length === 0 && (
              <tr>
                <td colSpan={4} className="py-12 text-center text-muted-foreground">
                  Aucun gardien n'a encore gardé sa cage inviolée...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
