import { Router } from 'express';
import { triggerSync } from '../controllers/adminController';

const router = Router();

/**
 * @route   POST /api/admin/sync
 * @desc    Trigger a full database sync from external API
 * @access  Public (Note: In a real app, protect this with a secret key or admin check)
 */
router.post('/sync', triggerSync);

export default router;