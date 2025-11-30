import { Router } from 'express';
import {
  getAllSports,
  getLeaguesBySport,
  getAllLeagues,
  getTeamsByLeague,
} from '../controllers/sportsController';

const router = Router();

/**
 * @route   GET /api/sports
 * @desc    Get all sports
 * @access  Public
 */
router.get('/', getAllSports);

/**
 * @route   GET /api/sports/:sportId/leagues
 * @desc    Get leagues by sport ID
 * @access  Public
 */
router.get('/:sportId/leagues', getLeaguesBySport);

/**
 * @route   GET /api/leagues
 * @desc    Get all leagues
 * @access  Public
 */
router.get('/leagues', getAllLeagues);

/**
 * @route   GET /api/leagues/:leagueId/teams
 * @desc    Get teams by league ID
 * @access  Public
 */
router.get('/leagues/:leagueId/teams', getTeamsByLeague);

export default router;