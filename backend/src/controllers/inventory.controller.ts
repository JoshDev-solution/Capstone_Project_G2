import { Request, Response, NextFunction } from 'express';
import { inventoryService } from '../services/inventory.service';

export class InventoryController {
  async getAllInventory(req: Request, res: Response, next: NextFunction) {
    try {
      const inventory = await inventoryService.getAllInventory();
      res.json(inventory);
    } catch (error) {
      next(error);
    }
  }

  async getLowStockAlerts(req: Request, res: Response, next: NextFunction) {
    try {
      const alerts = await inventoryService.getLowStockAlerts();
      res.json(alerts);
    } catch (error) {
      next(error);
    }
  }

  async getInventoryById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const inventory = await inventoryService.getInventoryById(id);
      if (!inventory) {
        return res.status(404).json({ message: 'Inventory not found' });
      }
      res.json(inventory);
    } catch (error) {
      next(error);
    }
  }

  async createInventory(req: Request, res: Response, next: NextFunction) {
    try {
      const inventory = await inventoryService.createInventory(req.body);
      res.status(201).json(inventory);
    } catch (error) {
      next(error);
    }
  }

  async updateInventory(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const inventory = await inventoryService.updateInventory(id, req.body);
      res.json(inventory);
    } catch (error) {
      next(error);
    }
  }

  async deleteInventory(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      await inventoryService.deleteInventory(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const inventoryController = new InventoryController();
