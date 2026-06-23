import prisma from '../utils/prisma';

export class ProductService {
  async getAllProducts() {
    return await prisma.product.findMany({
      include: {
        category: true,
        inventory: true,
      },
    });
  }

  async getProductById(id: number) {
    return await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        inventory: true,
      },
    });
  }

  async createProduct(data: any) {
    return await prisma.product.create({
      data,
    });
  }

  async updateProduct(id: number, data: any) {
    return await prisma.product.update({
      where: { id },
      data,
    });
  }

  async deleteProduct(id: number) {
    return await prisma.product.delete({
      where: { id },
    });
  }
}

export const productService = new ProductService();
