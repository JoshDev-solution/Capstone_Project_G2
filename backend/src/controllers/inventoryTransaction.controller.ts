import { Request, Response, NextFunction } from 'express';
import { inventoryTransactionService } from '../services/inventoryTransaction.service';

export class InventoryTransactionController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const records = await inventoryTransactionService.getAll();
      res.json(records);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const record = await inventoryTransactionService.getById(id);
      if (!record) {
        return res.status(404).json({ message: 'InventoryTransaction not found' });
      }
      res.json(record);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const record = await inventoryTransactionService.create(req.body);
      res.status(201).json(record);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const record = await inventoryTransactionService.update(id, req.body);
      res.json(record);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      await inventoryTransactionService.delete(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const inventoryTransactionController = new InventoryTransactionController();
