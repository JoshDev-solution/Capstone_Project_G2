import prisma from '../utils/prisma';

export class DiscountService {
  async getAllDiscounts() {
    return await prisma.discount.findMany({
      include: {
        bills: true,
      },
    });
  }

  async getDiscountById(id: number) {
    return await prisma.discount.findUnique({
      where: { id },
      include: {
        bills: true,
      },
    });
  }

  async createDiscount(data: any) {
    return await prisma.discount.create({
      data,
    });
  }

  async updateDiscount(id: number, data: any) {
    return await prisma.discount.update({
      where: { id },
      data,
    });
  }

  async deleteDiscount(id: number) {
    return await prisma.discount.delete({
      where: { id },
    });
  }
}

export const discountService = new DiscountService();
