import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import prisma from '../utils/prisma';

export class UserController {
  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await prisma.user.findMany({
        include: {
          role: true,
          staff: true,
          client: true,
        }
      });
      
      const mappedUsers = users.map(u => {
        const name = `${u.firstName || ''} ${u.lastName || ''}`.trim() || (u.email.split('@')[0]);
        const phone = u.phone || "N/A";

        return {
          id: u.id,
          name,
          email: u.email,
          role: u.role.name,
          status: u.isActive ? "Active" : "Inactive",
          joined: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(u.createdAt)),
          phone,
          profileImageUrl: null // Implement file uploads later if needed
        };
      });
      res.json(mappedUsers);
    } catch (error) {
      next(error);
    }
  }

  async getCounts(req: Request, res: Response, next: NextFunction) {
    try {
      // Stubbed since missing from Prisma schema
      res.json({ registrationsCount: 0, notificationsCount: 0 });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.user.userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        include: { role: true, staff: true, client: true }
      });
      
      if (!user) return res.status(404).json({ message: 'User not found' });
      
      const firstName = user.firstName || "";
      const lastName = user.lastName || "";

      res.json({
        firstName,
        lastName,
        role: user.role.name,
        profileImageUrl: user.profileImageUrl
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.user.userId) return res.status(401).json({ message: 'Unauthorized' });
      const { firstName, lastName, phone } = req.body;
      const updated = await prisma.user.update({
        where: { id: req.user.userId },
        data: { firstName, lastName, phone }
      });
      res.json({ message: 'Profile updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async uploadProfilePicture(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.user.userId) return res.status(401).json({ message: 'Unauthorized' });
      if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

      const profileImageUrl = '/uploads/' + req.file.filename;
      
      // Save URL to database
      await prisma.user.update({ where: { id: req.user.userId }, data: { profileImageUrl } });
      
      res.json({ profileImageUrl });
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const user = await userService.getUserById(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const user = await userService.updateUser(id, req.body);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      await userService.deleteUser(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
