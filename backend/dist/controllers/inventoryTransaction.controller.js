"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inventoryTransactionController = exports.InventoryTransactionController = void 0;
const inventoryTransaction_service_1 = require("../services/inventoryTransaction.service");
class InventoryTransactionController {
    async getAll(req, res, next) {
        try {
            const records = await inventoryTransaction_service_1.inventoryTransactionService.getAll();
            res.json(records);
        }
        catch (error) {
            next(error);
        }
    }
    async getById(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            const record = await inventoryTransaction_service_1.inventoryTransactionService.getById(id);
            if (!record) {
                return res.status(404).json({ message: 'InventoryTransaction not found' });
            }
            res.json(record);
        }
        catch (error) {
            next(error);
        }
    }
    async create(req, res, next) {
        try {
            const record = await inventoryTransaction_service_1.inventoryTransactionService.create(req.body);
            res.status(201).json(record);
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            const record = await inventoryTransaction_service_1.inventoryTransactionService.update(id, req.body);
            res.json(record);
        }
        catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            await inventoryTransaction_service_1.inventoryTransactionService.delete(id);
            res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    }
}
exports.InventoryTransactionController = InventoryTransactionController;
exports.inventoryTransactionController = new InventoryTransactionController();
