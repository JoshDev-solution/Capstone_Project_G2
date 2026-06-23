import { Request, Response, NextFunction } from 'express';
import { chatbotLogService } from '../services/chatbotLog.service';

export class ChatbotLogController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const records = await chatbotLogService.getAll();
      res.json(records);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const record = await chatbotLogService.getById(id);
      if (!record) {
        return res.status(404).json({ message: 'ChatbotLog not found' });
      }
      res.json(record);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const record = await chatbotLogService.create(req.body);
      res.status(201).json(record);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const record = await chatbotLogService.update(id, req.body);
      res.json(record);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      await chatbotLogService.delete(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const chatbotLogController = new ChatbotLogController();
