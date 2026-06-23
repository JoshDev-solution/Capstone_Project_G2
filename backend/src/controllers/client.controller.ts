import { Request, Response, NextFunction } from 'express';
import { clientService } from '../services/client.service';

export class ClientController {
  async getAllClients(req: Request, res: Response, next: NextFunction) {
    try {
      const clients = await clientService.getAllClients();
      res.json(clients);
    } catch (error) {
      next(error);
    }
  }

  async getClientById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const client = await clientService.getClientById(id);
      if (!client) {
        return res.status(404).json({ message: 'Client not found' });
      }
      res.json(client);
    } catch (error) {
      next(error);
    }
  }

  async createClient(req: Request, res: Response, next: NextFunction) {
    try {
      const client = await clientService.createClient(req.body);
      res.status(201).json(client);
    } catch (error) {
      next(error);
    }
  }

  async updateClient(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const client = await clientService.updateClient(id, req.body);
      res.json(client);
    } catch (error) {
      next(error);
    }
  }

  async deleteClient(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      await clientService.deleteClient(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const clientController = new ClientController();
