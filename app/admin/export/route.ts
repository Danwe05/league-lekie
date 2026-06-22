import { createClient } from '@/lib/supabase-server'
import { getMatches, getClubs, getTopScorers } from '@/lib/api'
import { calculateStandings } from '@/lib/utils/standings'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') // 'standings' | 'scorers'
  const season = searchParams.get('season') || '2024-2025'

  // VERY LAZY AUTH CHECK (to be thorough we should use supabase auth properly)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    let csvStr = ''

    if (type === 'standings') {
      const clubs = await getClubs()
      const matches = await getMatches(season)
      const standings = calculateStandings(clubs, matches)

      csvStr = 'Position,Club,Joues,Gagnes,Nuls,Perdus,Buts Pour,Buts Contre,Diff,Points\n'
      csvStr += standings.map(row => (
        [row.position, row.clubName, row.played, row.won, row.drawn, row.lost, row.goalsFor, row.goalsAgainst, row.goalDifference, row.points]
          .map(cell => `"${cell}"`)
          .join(',')
      )).join('\n')

    } else if (type === 'scorers') {
      const scorers = await getTopScorers(season)

      csvStr = 'Rang,Joueur,Club,Buts\n'
      csvStr += scorers.map((scorer, idx) => (
        [idx + 1, scorer.playerName, scorer.clubName, scorer.goals]
          .map(cell => `"${cell}"`)
          .join(',')
      )).join('\n')

    } else {
      return new Response('Invalid export type requested.', { status: 400 })
    }

    const filename = `export_${type}_${season.replace('-', '_')}.csv`

    return new Response(csvStr, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })

  } catch (err) {
    console.error(err)
    return new Response('Internal Server Error', { status: 500 })
  }
}
