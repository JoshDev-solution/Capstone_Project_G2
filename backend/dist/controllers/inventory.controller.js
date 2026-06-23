"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inventoryController = exports.InventoryController = void 0;
const inventory_service_1 = require("../services/inventory.service");
class InventoryController {
    async getAllInventory(req, res, next) {
        try {
            const inventory = await inventory_service_1.inventoryService.getAllInventory();
            res.json(inventory);
        }
        catch (error) {
            next(error);
        }
    }
    async getInventoryById(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            const inventory = await inventory_service_1.inventoryService.getInventoryById(id);
            if (!inventory) {
                return res.status(404).json({ message: 'Inventory not found' });
            }
            res.json(inventory);
        }
        catch (error) {
            next(error);
        }
    }
    async createInventory(req, res, next) {
        try {
            const inventory = await inventory_service_1.inventoryService.createInventory(req.body);
            res.status(201).json(inventory);
        }
        catch (error) {
            next(error);
        }
    }
    async updateInventory(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            const inventory = await inventory_service_1.inventoryService.updateInventory(id, req.body);
            res.json(inventory);
        }
        catch (error) {
            next(error);
        }
    }
    async deleteInventory(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            await inventory_service_1.inventoryService.deleteInventory(id);
            res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    }
}
exports.InventoryController = InventoryController;
exports.inventoryController = new InventoryController();
