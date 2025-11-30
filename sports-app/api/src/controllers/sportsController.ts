import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

/**
 * Get all sports
 * GET /api/sports
 */
export const getAllSports = async (req: Request, res: Response): Promise<void> => {
  try {
    const sports = await prisma.sport.findMany({
      include: {
        _count: {
          select: {
            leagues: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    res.status(200).json({
      sports,
      count: sports.length,
    });
  } catch (error: any) {
    console.error('Get sports error:', error);
    res.status(500).json({
      error: 'Failed to fetch sports',
      message: error.message,
    });
  }
};

/**
 * Get leagues by sport ID
 * GET /api/sports/:sportId/leagues
 */
export const getLeaguesBySport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sportId } = req.params;

    if (!sportId) {
      res.status(400).json({
        error: 'Invalid request',
        message: 'Sport ID is required',
      });
      return;
    }

    const sport = await prisma.sport.findUnique({
      where: {
        id: parseInt(sportId, 10),
      },
    });

    if (!sport) {
      res.status(404).json({
        error: 'Sport not found',
        message: `Sport with ID ${sportId} does not exist`,
      });
      return;
    }

    const leagues = await prisma.league.findMany({
      where: {
        sportId: parseInt(sportId, 10),
      },
      include: {
        _count: {
          select: {
            teams: true,
            events: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    res.status(200).json({
      sport,
      leagues,
      count: leagues.length,
    });
  } catch (error: any) {
    console.error('Get leagues by sport error:', error);
    res.status(500).json({
      error: 'Failed to fetch leagues',
      message: error.message,
    });
  }
};

/**
 * Get all leagues
 * GET /api/leagues
 */
export const getAllLeagues = async (req: Request, res: Response): Promise<void> => {
  try {
    const leagues = await prisma.league.findMany({
      include: {
        sport: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            teams: true,
            events: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    res.status(200).json({
      leagues,
      count: leagues.length,
    });
  } catch (error: any) {
    console.error('Get leagues error:', error);
    res.status(500).json({
      error: 'Failed to fetch leagues',
      message: error.message,
    });
  }
};

/**
 * Get teams by league ID
 * GET /api/leagues/:leagueId/teams
 */
export const getTeamsByLeague = async (req: Request, res: Response): Promise<void> => {
  try {
    const { leagueId } = req.params;

    if (!leagueId) {
      res.status(400).json({
        error: 'Invalid request',
        message: 'League ID is required',
      });
      return;
    }

    const league = await prisma.league.findUnique({
      where: {
        id: parseInt(leagueId, 10),
      },
      include: {
        sport: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!league) {
      res.status(404).json({
        error: 'League not found',
        message: `League with ID ${leagueId} does not exist`,
      });
      return;
    }

    const teams = await prisma.team.findMany({
      where: {
        leagueId: parseInt(leagueId, 10),
      },
      orderBy: {
        name: 'asc',
      },
    });

    res.status(200).json({
      league,
      teams,
      count: teams.length,
    });
  } catch (error: any) {
    console.error('Get teams by league error:', error);
    res.status(500).json({
      error: 'Failed to fetch teams',
      message: error.message,
    });
  }
};