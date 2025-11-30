import { Request, Response } from 'express';
import { syncService } from '../services/syncService';

/**
 * Trigger full database sync
 * POST /api/admin/sync
 */
export const triggerSync = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🔄 Admin triggered manual sync...');
    
    // Optional: Allow specifying sports via body, e.g., { "sports": ["Basketball"] }
    const sportsToSync = req.body.sports || ['Soccer', 'Basketball', 'American Football'];
    
    // Run the sync (this interacts with TheSportsDB)
    const result = await syncService.fullSync(sportsToSync);

    if (result.success) {
      res.status(200).json({
        message: 'Sync completed successfully',
        stats: result.stats
      });
    } else {
      res.status(500).json({
        error: 'Sync failed',
        message: result.message
      });
    }
  } catch (error: any) {
    console.error('Manual sync error:', error);
    res.status(500).json({
      error: 'Internal server error during sync',
      message: error.message
    });
  }
};