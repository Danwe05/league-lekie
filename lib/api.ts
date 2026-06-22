import { supabase } from './supabase';
import { Club, Match, Actualite, Player, Goal, TopScorer } from './types';

// ─── CLUBS ────────────────────────────────────────────────────────
export async function getClubs(): Promise<Club[]> {
  const { data, error } = await supabase.from('clubs').select('*').order('name');
  if (error) { console.error('Error fetching clubs:', error); return []; }
  return data as Club[];
}

export async function getMatches(season?: string): Promise<Match[]> {
  let query = supabase
    .from('matches')
    .select('*, goals(*, players(name)), match_events(*, players(name))')
    .order('date', { ascending: true });
  if (season) query = query.eq('season', season);
  const { data, error } = await query;
  if (error) { console.error('Error fetching matches:', error); return []; }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((m: any) => ({
    id: m.id,
    homeTeamId: m.home_team_id,
    awayTeamId: m.away_team_id,
    date: m.date,
    homeScore: m.home_score,
    awayScore: m.away_score,
    matchday: m.matchday,
    status: m.status,
    season: m.season ?? '2024-2025',
    // Map goals
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    goals: (m.goals || []).map((g: any) => ({
      id: g.id,
      matchId: g.match_id,
      playerId: g.player_id,
      clubId: g.club_id,
      minute: g.minute,
      season: g.season,
      playerName: g.players?.name ?? 'Inconnu',
      clubName: g.clubs?.name ?? '',
    })),
    // Map events
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    events: (m.match_events || []).map((e: any) => ({
      id: e.id,
      matchId: e.match_id,
      playerId: e.player_id,
      clubId: e.club_id,
      type: e.type,
      minute: e.minute,
      season: e.season,
      playerName: e.players?.name ?? 'Inconnu',
    })),
  }));
}

// ─── ACTUALITES ───────────────────────────────────────────────────
export async function getActualites(): Promise<Actualite[]> {
  const { data, error } = await supabase.from('actualites').select('*').order('date', { ascending: false });
  if (error) { console.error('Error fetching actualites:', error); return []; }
  return data.map(a => ({
    id: a.id,
    title: a.title,
    content: a.content,
    date: a.date,
    imageUrl: a.image_url
  }));
}

export async function getActualiteById(id: string): Promise<Actualite | null> {
  const { data, error } = await supabase
    .from('actualites')
    .select('*')
    .eq('id', id)
    .single();
  if (error || !data) return null;
  return { id: data.id, title: data.title, content: data.content, date: data.date, imageUrl: data.image_url };
}

export async function getGoalsByMatch(matchId: string): Promise<(Goal & { playerName: string })[]> {
  const { data, error } = await supabase
    .from('goals')
    .select('*, players(name)')
    .eq('match_id', matchId)
    .order('minute', { ascending: true });
  if (error || !data) return [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((g: any) => ({
    id: g.id,
    matchId: g.match_id,
    playerId: g.player_id,
    clubId: g.club_id,
    minute: g.minute,
    season: g.season,
    playerName: g.players?.name ?? 'Inconnu',
  }));
}

// ─── PLAYERS ──────────────────────────────────────────────────────
export async function getPlayersByClub(clubId: string, season?: string): Promise<Player[]> {
  let query = supabase.from('players').select('*, goals(count)').eq('club_id', clubId).order('number');
  if (season) query = query.eq('season', season);
  const { data, error } = await query;
  if (error) { console.error('Error fetching players:', error); return []; }
  return data.map(p => ({
    id: p.id,
    clubId: p.club_id,
    name: p.name,
    position: p.position,
    number: p.number,
    photoUrl: p.photo_url,
    season: p.season,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    goals: (p.goals as any)?.[0]?.count ?? 0,
  }));
}

export async function getAllPlayers(season?: string): Promise<Player[]> {
  let query = supabase.from('players').select('*, clubs(name)').order('name');
  if (season) query = query.eq('season', season);
  const { data, error } = await query;
  if (error) { console.error('Error fetching all players:', error); return []; }
  return data.map(p => ({
    id: p.id,
    clubId: p.club_id,
    name: p.name,
    position: p.position,
    number: p.number,
    photoUrl: p.photo_url,
    season: p.season,
    // Extra club name for admin views
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    clubName: (p.clubs as any)?.name ?? '',
  }));
}

// ─── GOALS / TOP SCORERS ──────────────────────────────────────────
export async function getTopScorers(season?: string): Promise<TopScorer[]> {
  let query = supabase
    .from('goals')
    .select('player_id, season, players(name, club_id, photo_url, clubs(name))')
    .order('player_id');
  if (season) query = query.eq('season', season);
  const { data, error } = await query;
  if (error) { console.error('Error fetching top scorers:', error); return []; }

  // Aggregate goal counts per player
  const map = new Map<string, TopScorer>();
  for (const g of data) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const player = g.players as any;
    if (!player) continue;
    const existing = map.get(g.player_id);
    if (existing) {
      existing.goals++;
    } else {
      map.set(g.player_id, {
        playerId: g.player_id,
        playerName: player.name,
        clubId: player.club_id,
        clubName: player.clubs?.name ?? '?',
        goals: 1,
        season: g.season,
        photoUrl: player.photo_url ?? undefined,
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.goals - a.goals);
}

// ─── SEASONS ──────────────────────────────────────────────────────
export async function getSeasons(): Promise<string[]> {
  const { data, error } = await supabase.from('matches').select('season').order('season', { ascending: false });
  if (error) return ['2024-2025'];
  const unique = [...new Set((data ?? []).map(r => r.season as string).filter(Boolean))];
  return unique.length > 0 ? unique : ['2024-2025'];
}
