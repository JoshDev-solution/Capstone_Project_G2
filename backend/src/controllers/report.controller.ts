import { Request, Response, NextFunction } from 'express';
import { reportService } from '../services/report.service';

export class ReportController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const records = await reportService.getAll();
      res.json(records);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const record = await reportService.getById(id);
      if (!record) {
        return res.status(404).json({ message: 'Report not found' });
      }
      res.json(record);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const record = await reportService.create(req.body);
      res.status(201).json(record);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const record = await reportService.update(id, req.body);
      res.json(record);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      await reportService.delete(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const reportController = new ReportController();
