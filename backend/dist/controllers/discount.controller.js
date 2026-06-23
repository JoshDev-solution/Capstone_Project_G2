"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.discountController = exports.DiscountController = void 0;
const discount_service_1 = require("../services/discount.service");
class DiscountController {
    async getAllDiscounts(req, res, next) {
        try {
            const discounts = await discount_service_1.discountService.getAllDiscounts();
            res.json(discounts);
        }
        catch (error) {
            next(error);
        }
    }
    async getDiscountById(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            const discount = await discount_service_1.discountService.getDiscountById(id);
            if (!discount) {
                return res.status(404).json({ message: 'Discount not found' });
            }
            res.json(discount);
        }
        catch (error) {
            next(error);
        }
    }
    async createDiscount(req, res, next) {
        try {
            const discount = await discount_service_1.discountService.createDiscount(req.body);
            res.status(201).json(discount);
        }
        catch (error) {
            next(error);
        }
    }
    async updateDiscount(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            const discount = await discount_service_1.discountService.updateDiscount(id, req.body);
            res.json(discount);
        }
        catch (error) {
            next(error);
        }
    }
    async deleteDiscount(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            await discount_service_1.discountService.deleteDiscount(id);
            res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    }
}
exports.DiscountController = DiscountController;
exports.discountController = new DiscountController();
