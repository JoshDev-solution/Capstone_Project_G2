import { Request, Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboard.service';

export class DashboardController {
  async getAdminStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await dashboardService.getAdminStats();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();
