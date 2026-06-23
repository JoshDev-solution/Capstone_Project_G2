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
        return await prisma_1.default.product.create({
            data,
        });
    }
    async updateProduct(id, data) {
        return await prisma_1.default.product.update({
            where: { id },
            data,
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
