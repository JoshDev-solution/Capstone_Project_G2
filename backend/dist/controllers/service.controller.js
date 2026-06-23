"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.serviceController = exports.ServiceController = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
class ServiceController {
    async getAllServices(req, res, next) {
        try {
            const services = await prisma_1.default.service.findMany({
                orderBy: { name: 'asc' }
            });
            res.json(services);
        }
        catch (error) {
            next(error);
        }
    }
    async getServiceById(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            const service = await prisma_1.default.service.findUnique({
                where: { id }
            });
            if (!service) {
                return res.status(404).json({ message: 'Service not found' });
            }
            res.json(service);
        }
        catch (error) {
            next(error);
        }
    }
    async createService(req, res, next) {
        try {
            const { name, category, price, duration, description, active } = req.body;
            const service = await prisma_1.default.service.create({
                data: {
                    name,
                    category,
                    price,
                    duration,
                    description,
                    active
                }
            });
            res.status(201).json(service);
        }
        catch (error) {
            next(error);
        }
    }
    async updateService(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            const { name, category, price, duration, description, active } = req.body;
            const service = await prisma_1.default.service.update({
                where: { id },
                data: {
                    name,
                    category,
                    price,
                    duration,
                    description,
                    active
                }
            });
            res.json(service);
        }
        catch (error) {
            next(error);
        }
    }
    async deleteService(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            await prisma_1.default.service.delete({
                where: { id }
            });
            res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ServiceController = ServiceController;
exports.serviceController = new ServiceController();
