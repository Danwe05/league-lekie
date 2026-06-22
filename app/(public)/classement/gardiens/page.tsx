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
    <div className="container mx-auto px-4 py-12 flex-1">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
        <div>
          <h1 className="font-heading font-bold text-4xl uppercase tracking-tighter border-b-4 border-primary inline-block pb-2 mb-2">
            <span className="flex items-center gap-2">
              <ShieldAlert className="w-8 h-8 text-primary" /> Gants d'Or
            </span>
          </h1>
          <p className="text-muted-foreground mt-2">Les murailles du championnat (Clean Sheets).</p>
        </div>
        <div className="flex flex-col gap-4 items-end">
          <StandingsNav />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground text-left">
              <th className="py-3.5 pl-5 w-16 text-center font-medium text-xs uppercase tracking-wide">Rang</th>
              <th className="py-3.5 font-medium text-xs uppercase tracking-wide">Gardien</th>
              <th className="py-3.5 font-medium text-xs uppercase tracking-wide hidden sm:table-cell">Club</th>
              <th className="py-3.5 pr-5 text-right font-medium text-xs uppercase tracking-wide">Invincibilité</th>
            </tr>
          </thead>
          <tbody>
            {topGardiens.map((stat, idx) => (
              <tr key={stat.playerId} className={`border-b border-border/60 last:border-0 hover:bg-muted/40 transition-colors duration-200 ${idx < 3 ? 'bg-primary/[0.04]' : ''}`}>
                <td className="py-3.5 pl-5 font-medium text-center text-muted-foreground tabular-nums">
                   {idx === 0 ? <span className="text-yellow-500 text-lg sm:text-xl">🥇</span> : 
                    idx === 1 ? <span className="text-gray-400 text-lg sm:text-xl">🥈</span> : 
                    idx === 2 ? <span className="text-amber-600 text-lg sm:text-xl">🥉</span> : 
                    idx + 1}
                </td>
                <td className="py-3.5 font-semibold text-base text-foreground">
                  <Link href={`/joueurs/${stat.playerId}`} className="hover:text-primary hover:underline transition-colors">
                    {stat.playerName}
                  </Link>
                </td>
                <td className="py-3.5 text-muted-foreground hidden sm:table-cell">{stat.clubName}</td>
                <td className="py-3.5 pr-5 text-right font-heading font-bold text-xl text-primary tabular-nums">{stat.count} CS</td>
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
    </div>
  )
}
