import { Router } from 'express';
import { settingController } from '../controllers/setting.controller';
import { authenticate, authorizeRole } from '../middleware/auth.middleware';

const router = Router();

// Public route to fetch settings for the landing page
router.get('/', settingController.getSettings);

// Protected admin route to update settings
router.put('/', authenticate, authorizeRole(['Admin']), settingController.updateSettings);

export default router;
