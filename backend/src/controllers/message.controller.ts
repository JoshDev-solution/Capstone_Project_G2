import { Request, Response, NextFunction } from 'express';
import { messageService } from '../services/message.service';

export class MessageController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const records = await messageService.getAll();
      res.json(records);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const record = await messageService.getById(id);
      if (!record) {
        return res.status(404).json({ message: 'Message not found' });
      }
      res.json(record);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const record = await messageService.create(req.body);
      res.status(201).json(record);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const record = await messageService.update(id, req.body);
      res.json(record);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      await messageService.delete(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const messageController = new MessageController();
