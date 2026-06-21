import { getTopScorers, getSeasons } from '@/lib/api'
import { SeasonSelector } from '@/components/SeasonSelector'
import { Medal, Trophy } from 'lucide-react'
import { StandingsNav } from '@/components/StandingsNav'
import Link from 'next/link'

export default async function ButeursPage({
  searchParams,
}: {
  searchParams: Promise<{ season?: string }>
}) {
  const { season } = await searchParams
  const [topScorers, seasons] = await Promise.all([
    getTopScorers(season),
    getSeasons(),
  ])

  return (
    <div className="container mx-auto px-4 py-12 flex-1">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
        <div>
          <h1 className="font-heading font-bold text-4xl uppercase tracking-tighter border-b-4 border-primary inline-block pb-2 mb-2">
            <span className="flex items-center gap-2">
              <Trophy className="w-8 h-8 text-primary" /> Buteurs
            </span>
          </h1>
          <p className="text-muted-foreground mt-2">Le classement officiel des meilleurs buteurs de la ligue.</p>
        </div>
        <div className="flex flex-col gap-4 items-end">
          <StandingsNav season={season} />
          <SeasonSelector seasons={seasons} currentSeason={season} />
        </div>
      </div>

      {topScorers.length === 0 ? (
        <p className="text-muted-foreground text-center py-20">
          Aucun buteur enregistré pour cette saison.
        </p>
      ) : (
        <div className="border border-border rounded-xl bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-muted-foreground font-medium">
                <th className="px-4 py-3 w-12 text-center">Rang</th>
                <th className="px-4 py-3">Joueur</th>
                <th className="px-4 py-3">Club</th>
                <th className="px-4 py-3 text-center w-20">Buts</th>
              </tr>
            </thead>
            <tbody>
              {topScorers.map((scorer, idx) => (
                <tr key={scorer.playerId} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-center">
                    {idx === 0 ? (
                      <Medal className="w-5 h-5 text-yellow-500 mx-auto" />
                    ) : idx === 1 ? (
                      <Medal className="w-5 h-5 text-slate-400 mx-auto" />
                    ) : idx === 2 ? (
                      <Medal className="w-5 h-5 text-amber-600 mx-auto" />
                    ) : (
                      <span className="font-bold text-muted-foreground">{idx + 1}</span>
                    )}
                  </td>
                  <td className="py-4 font-bold text-base">
                  <Link href={`/joueurs/${scorer.playerId}`} className="hover:text-primary hover:underline transition-colors">
                    {scorer.playerName}
                  </Link>
                </td>
                  <td className="px-4 py-3 text-muted-foreground">{scorer.clubName}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="font-heading font-bold text-2xl text-primary">{scorer.goals}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
