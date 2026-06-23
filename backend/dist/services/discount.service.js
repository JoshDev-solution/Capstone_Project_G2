"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.discountService = exports.DiscountService = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
class DiscountService {
    async getAllDiscounts() {
        return await prisma_1.default.discount.findMany({
            include: {
                bills: true,
            },
        });
    }
    async getDiscountById(id) {
        return await prisma_1.default.discount.findUnique({
            where: { id },
            include: {
                bills: true,
            },
        });
    }
    async createDiscount(data) {
        return await prisma_1.default.discount.create({
            data,
        });
    }
    async updateDiscount(id, data) {
        return await prisma_1.default.discount.update({
            where: { id },
            data,
        });
    }
    async deleteDiscount(id) {
        return await prisma_1.default.discount.delete({
            where: { id },
        });
    }
}
exports.DiscountService = DiscountService;
exports.discountService = new DiscountService();
