export interface Sport {
  id: number;
  name: string;
}

export interface League {
  id: number;
  sportId: number;
  name: string;
  sport?: Sport;
}

export interface Team {
  id: number;
  leagueId: number;
  name: string;
  league?: League;
}

export interface Event {
  id: number;
  leagueId: number;
  homeTeamId: number;
  awayTeamId: number;
  eventDatetime: string;
  status: string;
  homeScore?: number;
  awayScore?: number;
  externalApiId?: string;
  league?: League;
  homeTeam?: Team;
  awayTeam?: Team;
}

export interface User {
  id: number;
  email: string;
  createdAt: string;
}

export interface UserEvent {
  id: number;
  userId: number;
  eventId: number;
  event?: Event;
}