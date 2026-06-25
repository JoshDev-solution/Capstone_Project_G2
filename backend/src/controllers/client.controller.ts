import { Request, Response, NextFunction } from 'express';
import { clientService } from '../services/client.service';
import prisma from '../utils/prisma';

export class ClientController {
  async getMyProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Find the client record for this user
      let client = await prisma.client.findUnique({
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
        client = await prisma.client.create({
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
    } catch (error) {
      next(error);
    }
  }
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
