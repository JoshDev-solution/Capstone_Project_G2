import { Request, Response, NextFunction } from 'express';
import { discountService } from '../services/discount.service';

export class DiscountController {
  async getAllDiscounts(req: Request, res: Response, next: NextFunction) {
    try {
      const discounts = await discountService.getAllDiscounts();
      res.json(discounts);
    } catch (error) {
      next(error);
    }
  }

  async getDiscountById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const discount = await discountService.getDiscountById(id);
      if (!discount) {
        return res.status(404).json({ message: 'Discount not found' });
      }
      res.json(discount);
    } catch (error) {
      next(error);
    }
  }

  async createDiscount(req: Request, res: Response, next: NextFunction) {
    try {
      const discount = await discountService.createDiscount(req.body);
      res.status(201).json(discount);
    } catch (error) {
      next(error);
    }
  }

  async updateDiscount(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const discount = await discountService.updateDiscount(id, req.body);
      res.json(discount);
    } catch (error) {
      next(error);
    }
  }

  async deleteDiscount(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      await discountService.deleteDiscount(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const discountController = new DiscountController();
