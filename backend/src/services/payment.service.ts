import prisma from '../utils/prisma';

export class PaymentService {
  async getAllPayments() {
    return await prisma.payment.findMany({
      include: {
        bill: true,
        refunds: true,
      },
    });
  }

  async getPaymentById(id: number) {
    return await prisma.payment.findUnique({
      where: { id },
      include: {
        bill: true,
        refunds: true,
      },
    });
  }

  async createPayment(data: any) {
    return await prisma.payment.create({
      data,
    });
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
