import prisma from '../utils/prisma';

export class InventoryService {
  async getAllInventory() {
    return await prisma.inventory.findMany({
      include: {
        product: true,
      },
    });
  }

  async getInventoryById(id: number) {
    return await prisma.inventory.findUnique({
      where: { id },
      include: {
        product: true,
      },
    });
  }

  async createInventory(data: any) {
    return await prisma.inventory.create({
      data,
    });
  }

  async updateInventory(id: number, data: any) {
    return await prisma.inventory.update({
      where: { id },
      data,
    });
  }

  async deleteInventory(id: number) {
    return await prisma.inventory.delete({
      where: { id },
    });
  }
}

export const inventoryService = new InventoryService();
