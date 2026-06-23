import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';

export class RefundController {
  async getAllRefunds(req: Request, res: Response, next: NextFunction) {
    try {
      const refunds = await prisma.refund.findMany({
        include: {
          payment: true,
          bill: {
            include: {
              client: {
                include: { user: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      
      const mapped = refunds.map((r: any) => ({
        id: r.id,
        paymentId: r.payment.paymentCode,
        clientName: `${r.bill.client.user.firstName || ''} ${r.bill.client.user.lastName || ''}`.trim() || r.bill.client.user.email.split('@')[0],
        amount: Number(r.amount),
        date: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(r.createdAt)),
        reason: r.reason || 'Requested by client',
        status: "Completed"
      }));
      
      res.json(mapped);
    } catch (error) {
      next(error);
    }
  }

  async getRefundById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const refund = await prisma.refund.findUnique({
        where: { id },
        include: {
          payment: true,
          bill: {
            include: {
              client: {
                include: { user: true }
              }
            }
          }
        }
      });
      if (!refund) {
        return res.status(404).json({ message: 'Refund not found' });
      }
      
      const mapped = {
        id: refund.id,
        paymentId: refund.payment.paymentCode,
        clientName: `${(refund as any).bill.client.user.firstName || ''} ${(refund as any).bill.client.user.lastName || ''}`.trim() || (refund as any).bill.client.user.email.split('@')[0],
        amount: Number(refund.amount),
        date: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(refund.createdAt)),
        reason: refund.reason || 'Requested by client',
        status: "Completed"
      };
      
      res.json(mapped);
    } catch (error) {
      next(error);
    }
  }

  async processRefund(req: Request, res: Response, next: NextFunction) {
    try {
      const { paymentId, amount, reason } = req.body;
      
      // Look up payment by code to get billId
      const paymentRecord = await prisma.payment.findUnique({
        where: { paymentCode: paymentId }
      });
      
      if (!paymentRecord) {
        return res.status(404).json({ message: 'Payment not found' });
      }

      const refund = await prisma.refund.create({
        data: {
          paymentId: paymentRecord.id,
          billId: paymentRecord.billId,
          amount,
          reason
        }
      });
      res.status(201).json(refund);
    } catch (error) {
      next(error);
    }
  }
}

export const refundController = new RefundController();
