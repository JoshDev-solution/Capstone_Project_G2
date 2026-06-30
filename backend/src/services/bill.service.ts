import prisma from '../utils/prisma';

export class BillService {
  async getAllBills() {
    return await prisma.bill.findMany({
      include: {
        client: { include: { user: true } },
        pet: true,
        appointment: true,
        discount: true,
        items: { include: { service: true, product: true } },
        payments: true,
        refunds: true,
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getBillById(id: number) {
    return await prisma.bill.findUnique({
      where: { id },
      include: {
        client: { include: { user: true } },
        pet: true,
        appointment: true,
        discount: true,
        items: { include: { service: true, product: true } },
        payments: true,
        refunds: true,
      },
    });
  }

  async createBill(data: any) {
    return await prisma.$transaction(async (tx) => {
      const bill = await tx.bill.create({
        data,
        include: { items: true } // Include items to get what was just created
      });

      // Deduct inventory for items that have a productId
      if (data.items && data.items.create) {
        for (const item of data.items.create) {
          if (item.productId && item.quantity) {
            await tx.inventory.updateMany({
              where: { productId: item.productId },
              data: {
                quantity: {
                  decrement: item.quantity
                }
              }
            });
          }
        }
      }

      return bill;
    });
  }

  async updateBill(id: number, data: any) {
    return await prisma.$transaction(async (tx) => {
      const bill = await tx.bill.update({
        where: { id },
        data,
        include: { items: true }
      });

      // Deduct inventory for newly added items if data.items.create exists
      if (data.items && data.items.create) {
        for (const item of data.items.create) {
          if (item.productId && item.quantity) {
            await tx.inventory.updateMany({
              where: { productId: item.productId },
              data: {
                quantity: {
                  decrement: item.quantity
                }
              }
            });
          }
        }
      }

      return bill;
    });
  }

  async deleteBill(id: number) {
    return await prisma.bill.delete({
      where: { id },
    });
  }
}

export const billService = new BillService();
