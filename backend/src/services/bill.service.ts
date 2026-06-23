import prisma from '../utils/prisma';

export class BillService {
  async getAllBills() {
    return await prisma.bill.findMany({
      include: {
        client: true,
        pet: true,
        appointment: true,
        discount: true,
        items: true,
        payments: true,
        refunds: true,
      },
    });
  }

  async getBillById(id: number) {
    return await prisma.bill.findUnique({
      where: { id },
      include: {
        client: true,
        pet: true,
        appointment: true,
        discount: true,
        items: true,
        payments: true,
        refunds: true,
      },
    });
  }

  async createBill(data: any) {
    return await prisma.bill.create({
      data,
    });
  }

  async updateBill(id: number, data: any) {
    return await prisma.bill.update({
      where: { id },
      data,
    });
  }

  async deleteBill(id: number) {
    return await prisma.bill.delete({
      where: { id },
    });
  }
}

export const billService = new BillService();
