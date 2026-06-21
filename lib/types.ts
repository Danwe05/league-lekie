export interface Club {
  id: string;
  name: string;
  logo: string;
  stadium: string;
  officials: string[];
}

export type MatchStatus = 'UPCOMING' | 'LIVE' | 'FINISHED';

export type Position = 'Gardien' | 'Défenseur' | 'Milieu' | 'Attaquant';

export interface Player {
  id: string;
  clubId: string;
  name: string;
  position: Position;
  number: number;
  photoUrl?: string;
  season: string;
}

export interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  date: string;
  homeScore?: number;
  awayScore?: number;
  matchday: number;
  status: MatchStatus;
  season: string;
}

export interface Goal {
  id: string;
  matchId: string;
  playerId: string;
  clubId: string;
  minute?: number;
  season: string;
}

export interface TopScorer {
  playerId: string;
  playerName: string;
  clubId: string;
  clubName: string;
  goals: number;
  season: string;
}

export interface Actualite {
  id: string;
  title: string;
  content: string;
  date: string;
  imageUrl?: string;
}

export interface StandingRow {
  position: number;
  clubId: string;
  clubName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}
