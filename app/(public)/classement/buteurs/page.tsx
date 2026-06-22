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
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-left">
                <th className="py-3.5 pl-5 w-16 text-center font-medium text-xs uppercase tracking-wide">Rang</th>
                <th className="py-3.5 font-medium text-xs uppercase tracking-wide">Joueur</th>
                <th className="py-3.5 font-medium text-xs uppercase tracking-wide">Club</th>
                <th className="py-3.5 pr-5 text-center w-24 font-medium text-xs uppercase tracking-wide">Buts</th>
              </tr>
            </thead>
            <tbody>
              {topScorers.map((scorer, idx) => (
                <tr key={scorer.playerId} className={`border-b border-border/60 last:border-0 hover:bg-muted/40 transition-colors duration-200 ${idx < 3 ? 'bg-primary/[0.04]' : ''}`}>
                  <td className="py-3.5 pl-5 text-center font-medium text-muted-foreground tabular-nums">
                    {idx === 0 ? (
                      <Medal className="w-5 h-5 text-yellow-500 mx-auto" />
                    ) : idx === 1 ? (
                      <Medal className="w-5 h-5 text-slate-400 mx-auto" />
                    ) : idx === 2 ? (
                      <Medal className="w-5 h-5 text-amber-600 mx-auto" />
                    ) : (
                      idx + 1
                    )}
                  </td>
                  <td className="py-3.5 font-semibold text-base text-foreground">
                    <Link href={`/joueurs/${scorer.playerId}`} className="flex items-center gap-3 hover:text-primary transition-colors group">
                      <div className="w-10 h-10 rounded-full bg-muted border-2 border-border flex items-center justify-center overflow-hidden shrink-0 group-hover:border-primary/40 transition-colors">
                        {scorer.photoUrl ? (
                          <img src={scorer.photoUrl} alt={scorer.playerName} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs font-bold text-muted-foreground">
                            {scorer.playerName.substring(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <span className="group-hover:underline">{scorer.playerName}</span>
                    </Link>
                  </td>
                  <td className="py-3.5 text-muted-foreground">{scorer.clubName}</td>
                  <td className="py-3.5 pr-5 text-center">
                    <span className="font-heading font-bold text-2xl text-primary tabular-nums">{scorer.goals}</span>
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
