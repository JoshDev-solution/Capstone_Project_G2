import prisma from '../utils/prisma';

export class PaymentService {
  async getAllPayments() {
    return await prisma.payment.findMany({
      include: {
        bill: {
          include: {
            items: { include: { product: true, service: true } },
            client: { include: { user: true } }
          }
        },
        refunds: true,
      },
      orderBy: { paymentDate: 'desc' }
    });
  }

  async getPaymentById(id: number) {
    return await prisma.payment.findUnique({
      where: { id },
      include: {
        bill: {
          include: {
            items: { include: { product: true, service: true } },
            client: { include: { user: true } }
          }
        },
        refunds: true,
      },
    });
  }

  async createPayment(data: any) {
    return await prisma.$transaction(async (tx) => {
      // Ensure paymentCode exists
      const paymentData = { ...data };
      if (!paymentData.paymentCode) {
        paymentData.paymentCode = `PAY-${Date.now()}`;
      }

      // Create the payment record
      const payment = await tx.payment.create({ data: paymentData });

      // If a bill is associated, we update its status to 'Paid'
      // In a real system, you'd check if sum of payments >= bill.totalAmount
      if (data.billId) {
        await tx.bill.update({
          where: { id: data.billId },
          data: { status: 'Paid' }
        });
      }

      return payment;
    });
  }

  async getDailySales() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const payments = await prisma.payment.findMany({
      where: {
        paymentDate: {
          gte: today,
        }
      }
    });

    const total = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    return { date: today, totalSales: total, count: payments.length };
  }

  async updatePayment(id: number, data: any) {
    return await prisma.payment.update({
      where: { id },
      data,
    });
  }

  async deletePayment(id: number) {
    return await prisma.payment.delete({
      where: { id },
    });
  }
}

export const paymentService = new PaymentService();
