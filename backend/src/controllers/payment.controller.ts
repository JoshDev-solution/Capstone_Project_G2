import { Request, Response, NextFunction } from 'express';
import { paymentService } from '../services/payment.service';

export class PaymentController {
  async getAllPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const payments = await paymentService.getAllPayments();
      const mapped = payments.map((p: any) => ({
        ...p,
        clientName: p.bill?.client?.user ? `${p.bill.client.user.firstName} ${p.bill.client.user.lastName || ''}`.trim() : 'Walk-in Customer',
        items: p.bill?.items?.map((item: any) => ({
          id: item.id,
          name: item.description || item.product?.name || item.service?.name,
          qty: item.quantity,
          price: Number(item.unitPrice),
          total: Number(item.totalPrice)
        })) || []
      }));
      res.json(mapped);
    } catch (error) {
      next(error);
    }
  }

  async getDailySales(req: Request, res: Response, next: NextFunction) {
    try {
      const sales = await paymentService.getDailySales();
      res.json(sales);
    } catch (error) {
      next(error);
    }
  }

  async getPaymentById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const payment = await paymentService.getPaymentById(id);
      if (!payment) {
        return res.status(404).json({ message: 'Payment not found' });
      }
      res.json(payment);
    } catch (error) {
      next(error);
    }
  }

  async createPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const payment = await paymentService.createPayment(req.body);
      res.status(201).json(payment);
    } catch (error) {
      next(error);
    }
  }

  async updatePayment(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const payment = await paymentService.updatePayment(id, req.body);
      res.json(payment);
    } catch (error) {
      next(error);
    }
  }

  async deletePayment(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      await paymentService.deletePayment(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const paymentController = new PaymentController();
