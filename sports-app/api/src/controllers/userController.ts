import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

/**
 * Get user's calendar (tracked events)
 * GET /api/user/calendar
 */
export const getUserCalendar = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Not authenticated',
        message: 'User not found in request',
      });
      return;
    }

    const userEvents = await prisma.userEvent.findMany({
      where: {
        userId: req.user.userId,
      },
      include: {
        event: {
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
        },
      },
      orderBy: {
        event: {
          eventDatetime: 'asc',
        },
      },
    });

    // Extract just the events
    const events = userEvents.map((ue) => ue.event);

    res.status(200).json({
      events,
      count: events.length,
    });
  } catch (error: any) {
    console.error('Get user calendar error:', error);
    res.status(500).json({
      error: 'Failed to fetch calendar',
      message: error.message,
    });
  }
};

/**
 * Add event to user's calendar
 * POST /api/user/calendar
 */
export const addEventToCalendar = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Not authenticated',
        message: 'User not found in request',
      });
      return;
    }

    const { eventId } = req.body;

    if (!eventId) {
      res.status(400).json({
        error: 'Validation error',
        message: 'Event ID is required',
      });
      return;
    }

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: {
        id: eventId,
      },
    });

    if (!event) {
      res.status(404).json({
        error: 'Event not found',
        message: `Event with ID ${eventId} does not exist`,
      });
      return;
    }

    // Check if already in calendar
    const existing = await prisma.userEvent.findFirst({
      where: {
        userId: req.user.userId,
        eventId,
      },
    });

    if (existing) {
      res.status(409).json({
        error: 'Already in calendar',
        message: 'This event is already in your calendar',
      });
      return;
    }

    // Add to calendar
    await prisma.userEvent.create({
      data: {
        userId: req.user.userId,
        eventId,
      },
    });

    res.status(201).json({
      message: 'Event added to calendar successfully',
      eventId,
    });
  } catch (error: any) {
    console.error('Add event to calendar error:', error);
    res.status(500).json({
      error: 'Failed to add event to calendar',
      message: error.message,
    });
  }
};

/**
 * Remove event from user's calendar
 * DELETE /api/user/calendar/:eventId
 */
export const removeEventFromCalendar = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Not authenticated',
        message: 'User not found in request',
      });
      return;
    }

    const { eventId } = req.params;

    if (!eventId) {
      res.status(400).json({
        error: 'Invalid request',
        message: 'Event ID is required',
      });
      return;
    }

    // Find the user event
    const userEvent = await prisma.userEvent.findFirst({
      where: {
        userId: req.user.userId,
        eventId: parseInt(eventId, 10),
      },
    });

    if (!userEvent) {
      res.status(404).json({
        error: 'Not found',
        message: 'Event not found in your calendar',
      });
      return;
    }

    // Delete the user event
    await prisma.userEvent.delete({
      where: {
        id: userEvent.id,
      },
    });

    res.status(200).json({
      message: 'Event removed from calendar successfully',
      eventId: parseInt(eventId, 10),
    });
  } catch (error: any) {
    console.error('Remove event from calendar error:', error);
    res.status(500).json({
      error: 'Failed to remove event from calendar',
      message: error.message,
    });
  }
};

/**
 * Check if event is in user's calendar
 * GET /api/user/calendar/check/:eventId
 */
export const checkEventInCalendar = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Not authenticated',
        message: 'User not found in request',
      });
      return;
    }

    const { eventId } = req.params;

    if (!eventId) {
      res.status(400).json({
        error: 'Invalid request',
        message: 'Event ID is required',
      });
      return;
    }

    const userEvent = await prisma.userEvent.findFirst({
      where: {
        userId: req.user.userId,
        eventId: parseInt(eventId, 10),
      },
    });

    res.status(200).json({
      inCalendar: !!userEvent,
      eventId: parseInt(eventId, 10),
    });
  } catch (error: any) {
    console.error('Check event in calendar error:', error);
    res.status(500).json({
      error: 'Failed to check calendar',
      message: error.message,
    });
  }
};