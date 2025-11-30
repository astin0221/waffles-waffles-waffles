import { Router } from 'express';
import { getEvents, getEventById, getUpcomingEvents } from '../controllers/eventsController';
import { optionalAuth } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/events/upcoming
 * @desc    Get upcoming events
 * @access  Public
 */
router.get('/upcoming', optionalAuth, getUpcomingEvents);

/**
 * @route   GET /api/events/:id
 * @desc    Get single event by ID
 * @access  Public
 */
router.get('/:id', optionalAuth, getEventById);

/**
 * @route   GET /api/events
 * @desc    Get all events with filtering
 * @access  Public
 * @query   sportId, leagueId, date, search, status, page, limit
 */
router.get('/', optionalAuth, getEvents);

export default router;