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
    const { name, category, sku, price, unit, stock, reorderLevel, expiry, active } = data;
    
    // Find or create category
    const cat = await prisma.category.upsert({
      where: { name: category },
      update: {},
      create: { name: category }
    });

    return await prisma.product.create({
      data: {
        name,
        sku,
        price: Number(price),
        unit,
        isActive: active,
        categoryId: cat.id,
        inventory: {
          create: {
            quantity: Number(stock),
            reorderLevel: Number(reorderLevel),
            expirationDate: expiry ? new Date(expiry) : null
          }
        }
      },
      include: {
        category: true,
        inventory: true
      }
    });
  }

  async updateProduct(id: number, data: any) {
    const { name, category, sku, price, unit, stock, reorderLevel, expiry, active } = data;
    
    const cat = await prisma.category.upsert({
      where: { name: category },
      update: {},
      create: { name: category }
    });

    return await prisma.product.update({
      where: { id },
      data: {
        name,
        sku,
        price: Number(price),
        unit,
        isActive: active,
        categoryId: cat.id,
        inventory: {
          upsert: {
            create: {
              quantity: Number(stock),
              reorderLevel: Number(reorderLevel),
              expirationDate: expiry ? new Date(expiry) : null
            },
            update: {
              quantity: Number(stock),
              reorderLevel: Number(reorderLevel),
              expirationDate: expiry ? new Date(expiry) : null
            }
          }
        }
      },
      include: {
        category: true,
        inventory: true
      }
    });
  }

  async deleteProduct(id: number) {
    return await prisma.product.delete({
      where: { id },
    });
  }
}

export const productService = new ProductService();
