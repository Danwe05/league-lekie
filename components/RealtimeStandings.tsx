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
    <div>
      {connected && (
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
          <span className="text-xs font-medium text-muted-foreground">Classement en direct</span>
        </div>
      )}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-border text-muted-foreground">
            <th className="text-left py-2 pl-2 w-6">#</th>
            <th className="text-left py-2">Club</th>
            <th className="text-center py-2 w-8">J</th>
            <th className="text-center py-2 w-8">G</th>
            <th className="text-center py-2 w-8">N</th>
            <th className="text-center py-2 w-8">P</th>
            <th className="text-center py-2 w-12 hidden md:table-cell">DB</th>
            <th className="text-center py-2 min-w-[80px]">Forme</th>
            <th className="text-center py-2 font-bold text-foreground w-12">Pts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={row.clubId} className={`border-b border-border/50 ${idx === 0 ? 'bg-primary/5' : ''}`}>
              <td className="py-2 pl-2 text-muted-foreground font-medium">{row.position}</td>
              <td className="py-2 font-bold truncate max-w-[120px]">{row.clubName}</td>
              <td className="py-2 text-center text-muted-foreground">{row.played}</td>
              <td className="py-2 text-center text-muted-foreground">{row.won}</td>
              <td className="py-2 text-center text-muted-foreground">{row.drawn}</td>
              <td className="py-2 text-center text-muted-foreground">{row.lost}</td>
              <td className="py-2 text-center text-muted-foreground hidden md:table-cell">{row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}</td>
              <td className="py-2">
                <div className="flex items-center justify-center gap-1">
                  {(row.form || []).map((res, i) => (
                    <span 
                      key={i} 
                      title={res === 'W' ? 'Victoire' : res === 'D' ? 'Nul' : 'Défaite'}
                      className={`w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center text-[8px] md:text-[10px] font-bold text-white ${
                        res === 'W' ? 'bg-green-500' : res === 'D' ? 'bg-gray-400' : 'bg-red-500'
                      }`}
                    >
                      {res === 'W' ? 'V' : res === 'D' ? 'N' : 'D'}
                    </span>
                  ))}
                  {(!row.form || row.form.length === 0) && <span className="text-xs text-muted-foreground">-</span>}
                </div>
              </td>
              <td className="py-2 text-center font-bold text-primary">{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
