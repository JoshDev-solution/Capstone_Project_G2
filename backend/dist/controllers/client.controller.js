"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientController = exports.ClientController = void 0;
const client_service_1 = require("../services/client.service");
const prisma_1 = __importDefault(require("../utils/prisma"));
class ClientController {
    async getMyProfile(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            // Find the client record for this user
            let client = await prisma_1.default.client.findUnique({
                where: { userId },
                include: {
                    pets: true,
                    appointments: {
                        orderBy: { appointmentDate: 'asc' }
                    },
                    bills: {
                        orderBy: { createdAt: 'desc' }
                    },
                    user: {
                        select: { firstName: true, lastName: true, email: true, phone: true }
                    }
                }
            });
            // Auto-create client profile if it doesn't exist (e.g. they just registered)
            if (!client) {
                client = await prisma_1.default.client.create({
                    data: {
                        userId,
                        clientCode: `CLI-${Math.floor(1000 + Math.random() * 9000)}`
                    },
                    include: {
                        pets: true,
                        appointments: true,
                        bills: true,
                        user: {
                            select: { firstName: true, lastName: true, email: true, phone: true }
                        }
                    }
                });
            }
            res.json(client);
        }
        catch (error) {
            next(error);
        }
    }
    async getAllClients(req, res, next) {
        try {
            const clients = await client_service_1.clientService.getAllClients();
            res.json(clients);
        }
        catch (error) {
            next(error);
        }
    }
    async getClientById(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            const client = await client_service_1.clientService.getClientById(id);
            if (!client) {
                return res.status(404).json({ message: 'Client not found' });
            }
            res.json(client);
        }
        catch (error) {
            next(error);
        }
    }
    async createClient(req, res, next) {
        try {
            const client = await client_service_1.clientService.createClient(req.body);
            res.status(201).json(client);
        }
        catch (error) {
            next(error);
        }
    }
    async updateClient(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            const client = await client_service_1.clientService.updateClient(id, req.body);
            res.json(client);
        }
        catch (error) {
            next(error);
        }
    }
    async deleteClient(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            await client_service_1.clientService.deleteClient(id);
            res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ClientController = ClientController;
exports.clientController = new ClientController();
