import prisma from '../utils/prisma';

export class InventoryService {
  async getAllInventory() {
    return await prisma.inventory.findMany({
      include: {
        product: true,
      },
    });
  }

  async getLowStockAlerts() {
    // Fetch all inventory items with product relation and filter where quantity <= reorderLevel
    // This is safe for a small-medium clinic scale.
    const allInventory = await prisma.inventory.findMany({
      include: { product: true },
    });
    return allInventory.filter(item => item.quantity <= item.reorderLevel);
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
