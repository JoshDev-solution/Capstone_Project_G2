"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productService = exports.ProductService = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
class ProductService {
    async getAllProducts() {
        return await prisma_1.default.product.findMany({
            include: {
                category: true,
                inventory: true,
            },
        });
    }
    async getProductById(id) {
        return await prisma_1.default.product.findUnique({
            where: { id },
            include: {
                category: true,
                inventory: true,
            },
        });
    }
    async createProduct(data) {
        const { name, category, sku, price, unit, stock, reorderLevel, expiry, active } = data;
        // Find or create category
        const cat = await prisma_1.default.category.upsert({
            where: { name: category },
            update: {},
            create: { name: category }
        });
        return await prisma_1.default.product.create({
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
    async updateProduct(id, data) {
        const { name, category, sku, price, unit, stock, reorderLevel, expiry, active } = data;
        const cat = await prisma_1.default.category.upsert({
            where: { name: category },
            update: {},
            create: { name: category }
        });
        return await prisma_1.default.product.update({
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
    async deleteProduct(id) {
        return await prisma_1.default.product.delete({
            where: { id },
        });
    }
}
exports.ProductService = ProductService;
exports.productService = new ProductService();
