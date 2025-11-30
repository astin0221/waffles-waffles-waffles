import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

/**
 * Get all events with optional filtering
 * GET /api/events?sportId=1&leagueId=2&date=2024-01-01&search=Lakers
 */
export const getEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      sportId,
      leagueId,
      date,
      search,
      status,
      page = '1',
      limit = '20',
    } = req.query;

    // Parse pagination
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};

    if (leagueId) {
      where.leagueId = parseInt(leagueId as string, 10);
    }

    if (status) {
      where.status = status as string;
    }

    // Date filtering
    if (date) {
      const startDate = new Date(date as string);
      const endDate = new Date(date as string);
      endDate.setHours(23, 59, 59, 999);

      where.eventDatetime = {
        gte: startDate,
        lte: endDate,
      };
    }

    // Search in team names
    if (search) {
      where.OR = [
        {
          homeTeam: {
            name: {
              contains: search as string,
              mode: 'insensitive',
            },
          },
        },
        {
          awayTeam: {
            name: {
              contains: search as string,
              mode: 'insensitive',
            },
          },
        },
      ];
    }

    // Filter by sport (through league)
    if (sportId) {
      where.league = {
        sportId: parseInt(sportId as string, 10),
      };
    }

    // Get total count for pagination
    const total = await prisma.event.count({ where });

    // Get events
    const events = await prisma.event.findMany({
      where,
      include: {
        homeTeam: {
          select: {
            id: true,
            name: true,
          },
        },
        awayTeam: {
          select: {
            id: true,
            name: true,
          },
        },
        league: {
          select: {
            id: true,
            name: true,
            sport: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        eventDatetime: 'asc',
      },
      skip,
      take: limitNum,
    });

    res.status(200).json({
      events,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error('Get events error:', error);
    res.status(500).json({
      error: 'Failed to fetch events',
      message: error.message,
    });
  }
};

/**
 * Get single event by ID
 * GET /api/events/:id
 */
export const getEventById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        error: 'Invalid request',
        message: 'Event ID is required',
      });
      return;
    }

    const event = await prisma.event.findUnique({
      where: {
        id: parseInt(id, 10),
      },
      include: {
        homeTeam: {
          select: {
            id: true,
            name: true,
          },
        },
        awayTeam: {
          select: {
            id: true,
            name: true,
          },
        },
        league: {
          select: {
            id: true,
            name: true,
            sport: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!event) {
      res.status(404).json({
        error: 'Event not found',
        message: `Event with ID ${id} does not exist`,
      });
      return;
    }

    res.status(200).json({ event });
  } catch (error: any) {
    console.error('Get event by ID error:', error);
    res.status(500).json({
      error: 'Failed to fetch event',
      message: error.message,
    });
  }
};

/**
 * Get upcoming events
 * GET /api/events/upcoming
 */
export const getUpcomingEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = '10' } = req.query;
    const limitNum = parseInt(limit as string, 10);

    const now = new Date();

    const events = await prisma.event.findMany({
      where: {
        eventDatetime: {
          gte: now,
        },
        status: 'Scheduled',
      },
      include: {
        homeTeam: {
          select: {
            id: true,
            name: true,
          },
        },
        awayTeam: {
          select: {
            id: true,
            name: true,
          },
        },
        league: {
          select: {
            id: true,
            name: true,
            sport: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        eventDatetime: 'asc',
      },
      take: limitNum,
    });

    res.status(200).json({
      events,
      count: events.length,
    });
  } catch (error: any) {
    console.error('Get upcoming events error:', error);
    res.status(500).json({
      error: 'Failed to fetch upcoming events',
      message: error.message,
    });
  }
};