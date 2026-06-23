"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientController = exports.ClientController = void 0;
const client_service_1 = require("../services/client.service");
class ClientController {
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
