import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller';
import { authenticate, authorizeRole } from '../middleware/auth.middleware';

const router = Router();

// Dashboard routes (we can extend this later with /manager, /cashier, /vet if needed)
router.get('/admin', authenticate, authorizeRole(['Admin']), dashboardController.getAdminStats);

export default router;
