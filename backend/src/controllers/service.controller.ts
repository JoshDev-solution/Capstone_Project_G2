import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';

export class ServiceController {
  async getAllServices(req: Request, res: Response, next: NextFunction) {
    try {
      const services = await prisma.service.findMany({
        orderBy: { name: 'asc' }
      });
      res.json(services);
    } catch (error) {
      next(error);
    }
  }

  async getServiceById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const service = await prisma.service.findUnique({
        where: { id }
      });
      if (!service) {
        return res.status(404).json({ message: 'Service not found' });
      }
      res.json(service);
    } catch (error) {
      next(error);
    }
  }

  async createService(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, category, price, duration, description, active } = req.body;
      const service = await prisma.service.create({
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
    } catch (error) {
      next(error);
    }
  }

  async updateService(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const { name, category, price, duration, description, active } = req.body;
      const service = await prisma.service.update({
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
    } catch (error) {
      next(error);
    }
  }

  async deleteService(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      await prisma.service.delete({
        where: { id }
      });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const serviceController = new ServiceController();
