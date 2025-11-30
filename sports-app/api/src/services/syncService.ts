import { prisma } from '../lib/prisma';
import { sportsApiClient, Sport, League, Team, Event } from './sportsApi';

/**
 * Database Sync Service
 * Syncs data from TheSportsDB API to local PostgreSQL database
 */

interface SyncResult {
  success: boolean;
  message: string;
  stats?: {
    sportsAdded: number;
    leaguesAdded: number;
    teamsAdded: number;
    eventsAdded: number;
    eventsUpdated: number;
  };
}

class SyncService {
  /**
   * Sync all sports from API to database
   */
  async syncSports(): Promise<number> {
    try {
      const apiSports = await sportsApiClient.getAllSports();
      let count = 0;

      for (const apiSport of apiSports) {
        await prisma.sport.upsert({
          where: { name: apiSport.strSport },
          update: {},
          create: { name: apiSport.strSport },
        });
        count++;
      }

      console.log(`✓ Synced ${count} sports`);
      return count;
    } catch (error) {
      console.error('Error syncing sports:', error);
      throw error;
    }
  }

  /**
   * Sync leagues for a specific sport
   */
  async syncLeaguesForSport(sportName: string): Promise<number> {
    try {
      // Get sport from database
      const sport = await prisma.sport.findUnique({
        where: { name: sportName },
      });

      if (!sport) {
        console.log(`Sport "${sportName}" not found in database`);
        return 0;
      }

      // Fetch leagues from API
      const apiLeagues = await sportsApiClient.getLeaguesBySport(sportName);
      let count = 0;

      for (const apiLeague of apiLeagues) {
        // Only sync leagues that match the sport
        if (apiLeague.strSport === sportName) {
          // Check if league already exists
          const existing = await prisma.league.findFirst({
            where: {
              sportId: sport.id,
              name: apiLeague.strLeague,
            },
          });

          if (!existing) {
            await prisma.league.create({
              data: {
                sportId: sport.id,
                name: apiLeague.strLeague,
              },
            });
            count++;
          }
        }
      }

      console.log(`✓ Synced ${count} leagues for ${sportName}`);
      return count;
    } catch (error) {
      console.error(`Error syncing leagues for ${sportName}:`, error);
      return 0;
    }
  }

  /**
   * Sync teams for a specific league
   */
  async syncTeamsForLeague(leagueName: string): Promise<number> {
    try {
      // Get league from database
      const league = await prisma.league.findFirst({
        where: { name: leagueName },
      });

      if (!league) {
        console.log(`League "${leagueName}" not found in database`);
        return 0;
      }

      // Fetch teams from API
      const apiTeams = await sportsApiClient.getTeamsByLeague(leagueName);
      let count = 0;

      for (const apiTeam of apiTeams) {
        // Check if team already exists
        const existing = await prisma.team.findFirst({
          where: {
            leagueId: league.id,
            name: apiTeam.strTeam,
          },
        });

        if (!existing) {
          await prisma.team.create({
            data: {
              leagueId: league.id,
              name: apiTeam.strTeam,
            },
          });
          count++;
        }
      }

      console.log(`✓ Synced ${count} teams for ${leagueName}`);
      return count;
    } catch (error) {
      console.error(`Error syncing teams for ${leagueName}:`, error);
      return 0;
    }
  }

  /**
   * Sync events for a specific league
   */
  async syncEventsForLeague(leagueId: string, leagueName: string): Promise<{ added: number; updated: number }> {
    try {
      // Get league from database
      const league = await prisma.league.findFirst({
        where: { name: leagueName },
        include: { teams: true },
      });

      if (!league) {
        console.log(`League "${leagueName}" not found in database`);
        return { added: 0, updated: 0 };
      }

      // Fetch upcoming events from API
      const apiEvents = await sportsApiClient.getUpcomingEventsByLeague(leagueId);
      let added = 0;
      let updated = 0;

      for (const apiEvent of apiEvents) {
        // Find home and away teams
        const homeTeam = league.teams.find((t) => t.name === apiEvent.strHomeTeam);
        const awayTeam = league.teams.find((t) => t.name === apiEvent.strAwayTeam);

        if (!homeTeam || !awayTeam) {
          console.log(`Skipping event: teams not found (${apiEvent.strHomeTeam} vs ${apiEvent.strAwayTeam})`);
          continue;
        }

        // Parse date and time
        const eventDatetime = this.parseEventDateTime(apiEvent.dateEvent, apiEvent.strTime);

        // Determine status
        const status = this.determineEventStatus(apiEvent);

        // Check if event already exists
        const existingEvent = await prisma.event.findUnique({
          where: { externalApiId: apiEvent.idEvent },
        });

        if (existingEvent) {
          // Update existing event
          await prisma.event.update({
            where: { id: existingEvent.id },
            data: {
              status,
              homeScore: apiEvent.intHomeScore ? parseInt(apiEvent.intHomeScore) : null,
              awayScore: apiEvent.intAwayScore ? parseInt(apiEvent.intAwayScore) : null,
            },
          });
          updated++;
        } else {
          // Create new event
          await prisma.event.create({
            data: {
              leagueId: league.id,
              homeTeamId: homeTeam.id,
              awayTeamId: awayTeam.id,
              eventDatetime,
              status,
              homeScore: apiEvent.intHomeScore ? parseInt(apiEvent.intHomeScore) : null,
              awayScore: apiEvent.intAwayScore ? parseInt(apiEvent.intAwayScore) : null,
              externalApiId: apiEvent.idEvent,
            },
          });
          added++;
        }
      }

      console.log(`✓ Synced events for ${leagueName}: ${added} added, ${updated} updated`);
      return { added, updated };
    } catch (error) {
      console.error(`Error syncing events for ${leagueName}:`, error);
      return { added: 0, updated: 0 };
    }
  }

  /**
   * Full sync: sports, leagues, teams, and events
   */
  async fullSync(sportsToSync: string[] = ['Soccer', 'Basketball', 'American Football']): Promise<SyncResult> {
    try {
      console.log('🔄 Starting full database sync...\n');

      const stats = {
        sportsAdded: 0,
        leaguesAdded: 0,
        teamsAdded: 0,
        eventsAdded: 0,
        eventsUpdated: 0,
      };

      // Step 1: Sync all sports
      console.log('📊 Step 1: Syncing sports...');
      stats.sportsAdded = await this.syncSports();

      // Step 2: Sync leagues for specified sports
      console.log('\n🏆 Step 2: Syncing leagues...');
      for (const sportName of sportsToSync) {
        const count = await this.syncLeaguesForSport(sportName);
        stats.leaguesAdded += count;
      }

      // Step 3: Sync teams for major leagues
      console.log('\n👥 Step 3: Syncing teams...');
      const majorLeagues = [
        'English Premier League',
        'NBA',
        'NFL',
        'La Liga',
        'Serie A',
        'Bundesliga',
      ];

      for (const leagueName of majorLeagues) {
        const count = await this.syncTeamsForLeague(leagueName);
        stats.teamsAdded += count;
      }

      // Step 4: Sync events for major leagues
      console.log('\n📅 Step 4: Syncing events...');
      const leagueIds: { [key: string]: string } = {
        'English Premier League': '4328',
        'NBA': '4387',
        'NFL': '4391',
        'La Liga': '4335',
        'Serie A': '4332',
        'Bundesliga': '4331',
      };

      for (const [leagueName, leagueId] of Object.entries(leagueIds)) {
        const result = await this.syncEventsForLeague(leagueId, leagueName);
        stats.eventsAdded += result.added;
        stats.eventsUpdated += result.updated;
      }

      console.log('\n✅ Full sync completed successfully!');
      console.log('📈 Stats:', stats);

      return {
        success: true,
        message: 'Full sync completed successfully',
        stats,
      };
    } catch (error: any) {
      console.error('❌ Full sync failed:', error);
      return {
        success: false,
        message: `Sync failed: ${error.message}`,
      };
    }
  }

  /**
   * Helper: Parse event date and time
   */
  private parseEventDateTime(dateStr: string, timeStr?: string): Date {
    // dateStr format: YYYY-MM-DD
    // timeStr format: HH:MM:SS or undefined
    const date = new Date(dateStr);
    
    if (timeStr) {
      const timeParts = timeStr.split(':').map(Number);
      const hours = timeParts[0] || 0;
      const minutes = timeParts[1] || 0;
      date.setHours(hours, minutes, 0, 0);
    } else {
      date.setHours(12, 0, 0, 0); // Default to noon if no time specified
    }

    return date;
  }

  /**
   * Helper: Determine event status
   */
  private determineEventStatus(apiEvent: Event): string {
    if (apiEvent.intHomeScore && apiEvent.intAwayScore) {
      return 'Final';
    }
    
    const eventDate = new Date(apiEvent.dateEvent);
    const now = new Date();
    
    if (eventDate < now) {
      return 'Final';
    }
    
    return 'Scheduled';
  }
}

// Export singleton instance
export const syncService = new SyncService();
export default syncService;