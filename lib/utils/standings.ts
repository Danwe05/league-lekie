import { Club, Match, StandingRow } from "../types";

export function calculateStandings(clubs: Club[], matches: Match[]): StandingRow[] {
  const standingsMap = new Map<string, StandingRow>();
  
  clubs.forEach(club => {
    standingsMap.set(club.id, {
      position: 0,
      clubId: club.id,
      clubName: club.name,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0
    });
  });

  matches.forEach(match => {
    if (match.status !== 'FINISHED' || match.homeScore === undefined || match.awayScore === undefined) {
      return;
    }

    const home = standingsMap.get(match.homeTeamId);
    const away = standingsMap.get(match.awayTeamId);

    if (!home || !away) return;

    home.played += 1;
    away.played += 1;

    home.goalsFor += match.homeScore;
    home.goalsAgainst += match.awayScore;
    home.goalDifference = home.goalsFor - home.goalsAgainst;

    away.goalsFor += match.awayScore;
    away.goalsAgainst += match.homeScore;
    away.goalDifference = away.goalsFor - away.goalsAgainst;

    if (match.homeScore > match.awayScore) {
      home.won += 1;
      away.lost += 1;
      home.points += 3;
    } else if (match.homeScore < match.awayScore) {
      away.won += 1;
      home.lost += 1;
      away.points += 3;
    } else {
      home.drawn += 1;
      away.drawn += 1;
      home.points += 1;
      away.points += 1;
    }
  });

  const sortedStandings = Array.from(standingsMap.values()).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });

  return sortedStandings.map((row, index) => ({
    ...row,
    position: index + 1
  }));
}
