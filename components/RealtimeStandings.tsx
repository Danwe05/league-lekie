'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Club, Match } from '@/lib/types'
import { calculateStandings } from '@/lib/utils/standings'
import { StandingRow } from '@/lib/types'

interface Props {
  initialMatches: Match[]
  initialClubs: Club[]
  maxRows?: number
}

/**
 * Real-time standings table — subscribes to the `matches` table.
 * When a score is updated in the admin, the classement refreshes automatically.
 */
export function RealtimeStandings({ initialMatches, initialClubs, maxRows }: Props) {
  const [matches, setMatches] = useState<Match[]>(initialMatches)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('matches-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'matches' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const m = payload.new as Record<string, unknown>
            setMatches(prev => [...prev, {
              id: m.id as string,
              homeTeamId: m.home_team_id as string,
              awayTeamId: m.away_team_id as string,
              date: m.date as string,
              homeScore: m.home_score as number | undefined,
              awayScore: m.away_score as number | undefined,
              matchday: m.matchday as number,
              status: m.status as Match['status'],
              season: (m.season as string) || '2024-2025',
            }])
          } else if (payload.eventType === 'UPDATE') {
            const m = payload.new as Record<string, unknown>
            setMatches(prev => prev.map(existing =>
              existing.id === m.id ? {
                id: m.id as string,
                homeTeamId: m.home_team_id as string,
                awayTeamId: m.away_team_id as string,
                date: m.date as string,
                homeScore: m.home_score as number | undefined,
                awayScore: m.away_score as number | undefined,
                matchday: m.matchday as number,
                status: m.status as Match['status'],
                season: (m.season as string) || '2024-2025',
              } : existing
            ))
          } else if (payload.eventType === 'DELETE') {
            setMatches(prev => prev.filter(existing => existing.id !== (payload.old as { id: string }).id))
          }
        }
      )
      .subscribe((status) => {
        setConnected(status === 'SUBSCRIBED')
      })

    return () => { supabase.removeChannel(channel) }
  }, [])

  const standings: StandingRow[] = calculateStandings(initialClubs, matches)
  const rows = maxRows ? standings.slice(0, maxRows) : standings

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      {connected && (
        <div className="flex items-center gap-2 px-5 pt-4 pb-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <span className="text-xs font-semibold text-muted-foreground tracking-wide">Classement en direct</span>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="text-left py-3.5 pl-5 w-8 font-medium text-xs uppercase tracking-wide">#</th>
              <th className="text-left py-3.5 font-medium text-xs uppercase tracking-wide">Club</th>
              <th className="text-center py-3.5 w-8 font-medium text-xs uppercase tracking-wide">J</th>
              <th className="text-center py-3.5 w-8 font-medium text-xs uppercase tracking-wide">G</th>
              <th className="text-center py-3.5 w-8 font-medium text-xs uppercase tracking-wide">N</th>
              <th className="text-center py-3.5 w-8 font-medium text-xs uppercase tracking-wide">P</th>
              <th className="text-center py-3.5 w-12 font-medium text-xs uppercase tracking-wide hidden md:table-cell">DB</th>
              <th className="text-center py-3.5 min-w-[90px] font-medium text-xs uppercase tracking-wide">Forme</th>
              <th className="text-center py-3.5 pr-5 font-semibold text-foreground text-xs uppercase tracking-wide w-14">Pts</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr
                key={row.clubId}
                className={`border-b border-border/60 last:border-0 hover:bg-muted/40 transition-colors duration-200 ${idx === 0 ? 'bg-primary/[0.04]' : ''}`}
              >
                <td className="py-3.5 pl-5 text-muted-foreground font-medium tabular-nums">{row.position}</td>
                <td className="py-3.5 font-semibold text-foreground truncate max-w-[120px]">{row.clubName}</td>
                <td className="py-3.5 text-center text-muted-foreground tabular-nums">{row.played}</td>
                <td className="py-3.5 text-center text-muted-foreground tabular-nums">{row.won}</td>
                <td className="py-3.5 text-center text-muted-foreground tabular-nums">{row.drawn}</td>
                <td className="py-3.5 text-center text-muted-foreground tabular-nums">{row.lost}</td>
                <td className="py-3.5 text-center text-muted-foreground tabular-nums hidden md:table-cell">{row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}</td>
                <td className="py-3.5">
                  <div className="flex items-center justify-center gap-1">
                    {(row.form || []).map((res, i) => (
                      <span
                        key={i}
                        title={res === 'W' ? 'Victoire' : res === 'D' ? 'Nul' : 'Défaite'}
                        className={`w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center text-[8px] md:text-[10px] font-bold text-white shadow-sm ${
                          res === 'W' ? 'bg-green-500' : res === 'D' ? 'bg-gray-400' : 'bg-red-500'
                        }`}
                      >
                        {res === 'W' ? 'V' : res === 'D' ? 'N' : 'D'}
                      </span>
                    ))}
                    {(!row.form || row.form.length === 0) && <span className="text-xs text-muted-foreground">—</span>}
                  </div>
                </td>
                <td className="py-3.5 pr-5 text-center font-heading font-bold text-primary tabular-nums">{row.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}