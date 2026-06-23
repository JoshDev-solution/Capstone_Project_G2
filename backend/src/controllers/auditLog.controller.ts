import { Request, Response, NextFunction } from 'express';
import { auditLogService } from '../services/auditLog.service';

export class AuditLogController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const records = await auditLogService.getAll();
      res.json(records);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const record = await auditLogService.getById(id);
      if (!record) {
        return res.status(404).json({ message: 'AuditLog not found' });
      }
      res.json(record);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const record = await auditLogService.create(req.body);
      res.status(201).json(record);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const record = await auditLogService.update(id, req.body);
      res.json(record);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      await auditLogService.delete(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const auditLogController = new AuditLogController();
