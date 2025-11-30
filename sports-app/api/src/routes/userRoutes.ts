import { Router } from 'express';
import {
  getUserCalendar,
  addEventToCalendar,
  removeEventFromCalendar,
  checkEventInCalendar,
} from '../controllers/userController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All user routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/user/calendar
 * @desc    Get user's calendar (tracked events)
 * @access  Private
 */
router.get('/calendar', getUserCalendar);

/**
 * @route   POST /api/user/calendar
 * @desc    Add event to user's calendar
 * @access  Private
 */
router.post('/calendar', addEventToCalendar);

/**
 * @route   DELETE /api/user/calendar/:eventId
 * @desc    Remove event from user's calendar
 * @access  Private
 */
router.delete('/calendar/:eventId', removeEventFromCalendar);

/**
 * @route   GET /api/user/calendar/check/:eventId
 * @desc    Check if event is in user's calendar
 * @access  Private
 */
router.get('/calendar/check/:eventId', checkEventInCalendar);

export default router;