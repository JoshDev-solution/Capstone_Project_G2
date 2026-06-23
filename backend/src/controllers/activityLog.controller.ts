import { Request, Response, NextFunction } from 'express';
import { activityLogService } from '../services/activityLog.service';

export class ActivityLogController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const records = await activityLogService.getAll();
      res.json(records);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const record = await activityLogService.getById(id);
      if (!record) {
        return res.status(404).json({ message: 'ActivityLog not found' });
      }
      res.json(record);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const record = await activityLogService.create(req.body);
      res.status(201).json(record);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const record = await activityLogService.update(id, req.body);
      res.json(record);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      await activityLogService.delete(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const activityLogController = new ActivityLogController();
