import { Request, Response, NextFunction } from 'express';
import { discountService } from '../services/discount.service';

export class DiscountController {
  async getAllDiscounts(req: Request, res: Response, next: NextFunction) {
    try {
      const discounts = await discountService.getAllDiscounts();
      const mapped = discounts.map((d: any) => ({
        id: d.id,
        name: d.name,
        code: d.code || 'NO-CODE',
        type: d.type || 'Fixed Amount',
        value: Number(d.value),
        minPurchase: Number(d.minPurchase || 0),
        startDate: d.startDate ? new Date(d.startDate).toISOString().split('T')[0] : '',
        endDate: d.endDate ? new Date(d.endDate).toISOString().split('T')[0] : '',
        usageLimit: d.usageLimit || null,
        usageCount: d.usageCount || 0,
        active: d.isActive
      }));
      res.json(mapped);
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
      const { name, code, type, value, minPurchase, startDate, endDate, usageLimit, active } = req.body;
      const data = {
        name,
        code,
        type,
        value: Number(value),
        minPurchase: Number(minPurchase || 0),
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        usageLimit: usageLimit ? Number(usageLimit) : null,
        isActive: active
      };
      const discount = await discountService.createDiscount(data);
      res.status(201).json(discount);
    } catch (error) {
      next(error);
    }
  }

  async updateDiscount(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const { name, code, type, value, minPurchase, startDate, endDate, usageLimit, active } = req.body;
      const data = {
        name,
        code,
        type,
        value: Number(value),
        minPurchase: Number(minPurchase || 0),
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        usageLimit: usageLimit ? Number(usageLimit) : null,
        isActive: active
      };
      const discount = await discountService.updateDiscount(id, data);
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
