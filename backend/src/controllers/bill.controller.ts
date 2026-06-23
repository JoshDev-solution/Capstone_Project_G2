import { Request, Response, NextFunction } from 'express';
import { billService } from '../services/bill.service';

export class BillController {
  async getAllBills(req: Request, res: Response, next: NextFunction) {
    try {
      const bills = await billService.getAllBills();
      res.json(bills);
    } catch (error) {
      next(error);
    }
  }

  async getBillById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const bill = await billService.getBillById(id);
      if (!bill) {
        return res.status(404).json({ message: 'Bill not found' });
      }
      res.json(bill);
    } catch (error) {
      next(error);
    }
  }

  async createBill(req: Request, res: Response, next: NextFunction) {
    try {
      const bill = await billService.createBill(req.body);
      res.status(201).json(bill);
    } catch (error) {
      next(error);
    }
  }

  async updateBill(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const bill = await billService.updateBill(id, req.body);
      res.json(bill);
    } catch (error) {
      next(error);
    }
  }

  async deleteBill(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      await billService.deleteBill(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const billController = new BillController();
