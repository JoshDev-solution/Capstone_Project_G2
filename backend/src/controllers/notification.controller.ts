import { Request, Response, NextFunction } from 'express';
import { notificationService } from '../services/notification.service';

export class NotificationController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const records = await notificationService.getAll();
      res.json(records);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const record = await notificationService.getById(id);
      if (!record) {
        return res.status(404).json({ message: 'Notification not found' });
      }
      res.json(record);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const record = await notificationService.create(req.body);
      res.status(201).json(record);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const record = await notificationService.update(id, req.body);
      res.json(record);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      await notificationService.delete(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const notificationController = new NotificationController();
