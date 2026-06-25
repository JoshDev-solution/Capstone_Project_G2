"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.discountController = exports.DiscountController = void 0;
const discount_service_1 = require("../services/discount.service");
class DiscountController {
    async getAllDiscounts(req, res, next) {
        try {
            const discounts = await discount_service_1.discountService.getAllDiscounts();
            const mapped = discounts.map((d) => ({
                id: d.id,
                name: d.name,
                code: d.code || 'NO-CODE',
                type: d.type || 'Fixed Amount',
                value: Number(d.value),
                minPurchase: Number(d.minPurchase || 0),
                startDate: d.startDate ? new Date(d.startDate).toISOString().split('T')[0] : '',
                endDate: d.endDate ? new Date(d.endDate).toISOString().split('T')[0] : '',
                usageLimit: d.usageLimit || null,
                usageCount: d.usageCount || 0,
                active: d.isActive
            }));
            res.json(mapped);
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
            const { name, code, type, value, minPurchase, startDate, endDate, usageLimit, active } = req.body;
            const data = {
                name,
                code,
                type,
                value: Number(value),
                minPurchase: Number(minPurchase || 0),
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                usageLimit: usageLimit ? Number(usageLimit) : null,
                isActive: active
            };
            const discount = await discount_service_1.discountService.createDiscount(data);
            res.status(201).json(discount);
        }
        catch (error) {
            next(error);
        }
    }
    async updateDiscount(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            const { name, code, type, value, minPurchase, startDate, endDate, usageLimit, active } = req.body;
            const data = {
                name,
                code,
                type,
                value: Number(value),
                minPurchase: Number(minPurchase || 0),
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                usageLimit: usageLimit ? Number(usageLimit) : null,
                isActive: active
            };
            const discount = await discount_service_1.discountService.updateDiscount(id, data);
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
