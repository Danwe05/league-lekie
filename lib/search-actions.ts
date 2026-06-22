'use server'

import { createClient } from '@/lib/supabase-server'
import { Player } from '@/lib/types'

export async function searchPlayers(query: string): Promise<Player[]> {
  const supabase = await createClient()
  
  if (!query || query.trim().length === 0) return []
  
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .ilike('name', `%${query}%`)
    .limit(10)
    
  if (error) {
    console.error('Search error:', error)
    return []
  }
  
  return data.map((p: any) => ({
    id: p.id,
    clubId: p.club_id,
    name: p.name,
    number: p.number,
    position: p.position,
    photoUrl: p.photo_url,
    goals: p.goals,
    season: p.season
  }))
}
