import prisma from '../utils/prisma';

export class InventoryTransactionService {
  async getAll() {
    return await prisma.inventoryTransaction.findMany();
  }

  async getById(id: number) {
    return await prisma.inventoryTransaction.findUnique({
      where: { id },
    });
  }

  async create(data: any) {
    return await prisma.inventoryTransaction.create({
      data,
    });
  }

  async update(id: number, data: any) {
    return await prisma.inventoryTransaction.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    return await prisma.inventoryTransaction.delete({
      where: { id },
    });
  }
}

export const inventoryTransactionService = new InventoryTransactionService();
