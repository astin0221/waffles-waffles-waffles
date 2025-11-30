import axios, { AxiosInstance } from 'axios';

/**
 * TheSportsDB API Client
 * Documentation: https://www.thesportsdb.com/api.php
 */

interface Sport {
  idSport: string;
  strSport: string;
  strFormat: string;
  strSportThumb?: string;
  strSportDescription?: string;
}

interface League {
  idLeague: string;
  strLeague: string;
  strSport: string;
  strLeagueAlternate?: string;
}

interface Team {
  idTeam: string;
  strTeam: string;
  strTeamShort?: string;
  strAlternate?: string;
  intFormedYear?: string;
  strStadium?: string;
  strStadiumLocation?: string;
  strTeamBadge?: string;
}

interface Event {
  idEvent: string;
  strEvent: string;
  strLeague: string;
  idLeague: string;
  strHomeTeam: string;
  strAwayTeam: string;
  idHomeTeam: string;
  idAwayTeam: string;
  intHomeScore?: string;
  intAwayScore?: string;
  strStatus?: string;
  dateEvent: string;
  strTime?: string;
  strTimestamp?: string;
}

interface SportsApiResponse<T> {
  sports?: T[];
  leagues?: T[];
  teams?: T[];
  events?: T[];
  results?: T[];
}

class SportsApiClient {
  private client: AxiosInstance;
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.SPORTS_API_KEY || '3'; // '3' is the test key
    const baseURL = process.env.SPORTS_API_BASE_URL || 'https://www.thesportsdb.com/api/v1/json';
    
    this.client = axios.create({
      baseURL: `${baseURL}/${this.apiKey}`,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response: any) => response,
      (error: any) => {
        console.error('Sports API Error:', error.message);
        throw new Error(`Sports API request failed: ${error.message}`);
      }
    );
  }

  /**
   * Get all sports
   */
  async getAllSports(): Promise<Sport[]> {
    try {
      const response = await this.client.get<SportsApiResponse<Sport>>('/all_sports.php');
      return response.data.sports || [];
    } catch (error) {
      console.error('Error fetching sports:', error);
      return [];
    }
  }

  /**
   * Get all leagues for a specific sport
   */
  async getLeaguesBySport(sportName: string): Promise<League[]> {
    try {
      const response = await this.client.get<SportsApiResponse<League>>(
        `/search_all_leagues.php?s=${encodeURIComponent(sportName)}`
      );
      return response.data.leagues || [];
    } catch (error) {
      console.error(`Error fetching leagues for ${sportName}:`, error);
      return [];
    }
  }

  /**
   * Get all teams in a specific league
   */
  async getTeamsByLeague(leagueName: string): Promise<Team[]> {
    try {
      const response = await this.client.get<SportsApiResponse<Team>>(
        `/search_all_teams.php?l=${encodeURIComponent(leagueName)}`
      );
      return response.data.teams || [];
    } catch (error) {
      console.error(`Error fetching teams for league ${leagueName}:`, error);
      return [];
    }
  }

  /**
   * Get upcoming events for a specific league
   */
  async getUpcomingEventsByLeague(leagueId: string): Promise<Event[]> {
    try {
      const response = await this.client.get<SportsApiResponse<Event>>(
        `/eventsnextleague.php?id=${leagueId}`
      );
      return response.data.events || [];
    } catch (error) {
      console.error(`Error fetching upcoming events for league ${leagueId}:`, error);
      return [];
    }
  }

  /**
   * Get past events for a specific league
   */
  async getPastEventsByLeague(leagueId: string): Promise<Event[]> {
    try {
      const response = await this.client.get<SportsApiResponse<Event>>(
        `/eventspastleague.php?id=${leagueId}`
      );
      return response.data.events || [];
    } catch (error) {
      console.error(`Error fetching past events for league ${leagueId}:`, error);
      return [];
    }
  }

  /**
   * Get events for a specific team
   */
  async getEventsByTeam(teamId: string): Promise<Event[]> {
    try {
      const response = await this.client.get<SportsApiResponse<Event>>(
        `/eventslast.php?id=${teamId}`
      );
      return response.data.results || [];
    } catch (error) {
      console.error(`Error fetching events for team ${teamId}:`, error);
      return [];
    }
  }

  /**
   * Get event details by ID
   */
  async getEventById(eventId: string): Promise<Event | null> {
    try {
      const response = await this.client.get<SportsApiResponse<Event>>(
        `/lookupevent.php?id=${eventId}`
      );
      const events = response.data.events || [];
      return events.length > 0 ? events[0] : null;
    } catch (error) {
      console.error(`Error fetching event ${eventId}:`, error);
      return null;
    }
  }

  /**
   * Search for teams by name
   */
  async searchTeams(teamName: string): Promise<Team[]> {
    try {
      const response = await this.client.get<SportsApiResponse<Team>>(
        `/searchteams.php?t=${encodeURIComponent(teamName)}`
      );
      return response.data.teams || [];
    } catch (error) {
      console.error(`Error searching for team ${teamName}:`, error);
      return [];
    }
  }

  /**
   * Search for events by date
   */
  async getEventsByDate(date: string): Promise<Event[]> {
    try {
      // Date format: YYYY-MM-DD
      const response = await this.client.get<SportsApiResponse<Event>>(
        `/eventsday.php?d=${date}`
      );
      return response.data.events || [];
    } catch (error) {
      console.error(`Error fetching events for date ${date}:`, error);
      return [];
    }
  }
}

// Export singleton instance
export const sportsApiClient = new SportsApiClient();
export default sportsApiClient;

// Export types for use in other files
export type {
  Sport,
  League,
  Team,
  Event,
  SportsApiResponse,
};