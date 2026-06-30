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
      
      const mapped = refunds.map((r: any) => {
        const dateStr = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(r.createdAt));
        return {
          id: r.id,
          paymentId: r.payment?.paymentCode || 'UNKNOWN',
          code: `REF-${r.id.toString().padStart(6, '0')}`,
          clientName: `${r.bill?.client?.user?.firstName || ''} ${r.bill?.client?.user?.lastName || ''}`.trim() || r.bill?.client?.user?.email?.split('@')[0] || 'Unknown Client',
          amount: Number(r.amount),
          date: dateStr,
          requestedAt: dateStr,
          reason: r.reason || 'Requested by client',
          status: r.status,
          billCode: r.bill?.id ? `BILL-${r.bill.id.toString().padStart(6, '0')}` : 'N/A',
          paymentMethod: r.payment?.paymentMethod || 'N/A',
          processedAt: r.updatedAt ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(r.updatedAt)) : undefined
        };
      });
      
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
      
      const dateStr = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(refund.createdAt));
      const mapped = {
        id: refund.id,
        paymentId: refund.payment?.paymentCode || 'UNKNOWN',
        code: `REF-${refund.id.toString().padStart(6, '0')}`,
        clientName: `${(refund as any).bill?.client?.user?.firstName || ''} ${(refund as any).bill?.client?.user?.lastName || ''}`.trim() || (refund as any).bill?.client?.user?.email?.split('@')[0] || 'Unknown Client',
        amount: Number(refund.amount),
        date: dateStr,
        requestedAt: dateStr,
        reason: refund.reason || 'Requested by client',
        status: refund.status,
        billCode: (refund as any).bill?.id ? `BILL-${(refund as any).bill.id.toString().padStart(6, '0')}` : 'N/A',
        paymentMethod: refund.payment?.paymentMethod || 'N/A',
        processedAt: refund.updatedAt ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(refund.updatedAt)) : undefined
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
  async updateRefundStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const { status } = req.body;
      const refund = await prisma.refund.update({
        where: { id },
        data: { status }
      });
      res.json(refund);
    } catch (error) {
      next(error);
    }
  }
}

export const refundController = new RefundController();
