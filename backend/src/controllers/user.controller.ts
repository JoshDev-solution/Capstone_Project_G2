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
          profileImageUrl: u.profileImageUrl || undefined
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
      const user = await prisma.user.findUnique({
        where: { id: req.user?.userId },
        include: { role: true, staff: true, client: true }
      });
      if (!user) return res.status(404).json({ message: 'User not found' });
      
      // Return role as a string to prevent React rendering errors on the frontend
      const responseUser = {
        ...user,
        role: user.role?.name || 'User'
      };
      
      res.json(responseUser);
    } catch (error) {
      next(error);
    }
  }

  async getClients(req: Request, res: Response, next: NextFunction) {
    try {
      const clients = await prisma.user.findMany({
        where: { role: { name: 'Client' }, isActive: true },
        select: { id: true, firstName: true, lastName: true, email: true }
      });
      const mapped = clients.map(c => ({
        id: c.id,
        name: `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.email.split('@')[0],
        email: c.email
      }));
      res.json(mapped);
    } catch (error) {
      next(error);
    }
  }

  async getVets(req: Request, res: Response, next: NextFunction) {
    try {
      const vets = await prisma.user.findMany({
        where: { role: { name: 'Vet' } },
        select: { id: true, firstName: true, lastName: true }
      });
      res.json(vets.map(v => ({ id: v.id, name: `${v.firstName || ''} ${v.lastName || ''}`.trim() })));
    } catch (error) {
      next(error);
    }
  }

  async getRegistrations(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await prisma.user.findMany({
        where: {
          role: { name: 'Client' },
          isApproved: false,
          isActive: true
        },
        include: {
          client: {
            include: { pets: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      
      const mapped = users.map(u => ({
        id: u.id,
        name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email.split('@')[0],
        email: u.email,
        phone: u.phone || 'N/A',
        address: 'N/A', // Address not in schema
        submittedAt: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' }).format(new Date(u.createdAt)),
        status: "Pending",
        pets: u.client?.pets.map(p => p.name) || []
      }));
      res.json(mapped);
    } catch (error) {
      next(error);
    }
  }

  async approveRegistration(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      await prisma.user.update({
        where: { id },
        data: { isApproved: true }
      });
      res.status(200).json({ message: 'Approved' });
    } catch (error) {
      next(error);
    }
  }

  async rejectRegistration(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      await prisma.user.update({
        where: { id },
        data: { isActive: false }
      });
      res.status(200).json({ message: 'Rejected' });
    } catch (error) {
      next(error);
    }
  }

  async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.user.userId) return res.status(401).json({ message: 'Unauthorized' });
      const notifications = await prisma.notification.findMany({
        where: { userId: req.user.userId },
        orderBy: { createdAt: 'desc' }
      });
      const mapped = notifications.map(n => ({
        id: n.id,
        title: n.title,
        message: n.message,
        time: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' }).format(new Date(n.createdAt)),
        type: (n as any).notificationType || 'System',
        read: n.isRead
      }));
      res.json(mapped);
    } catch (error) {
      next(error);
    }
  }

  async readNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      await prisma.notification.update({
        where: { id },
        data: { isRead: true }
      });
      res.status(200).json({ message: 'Marked read' });
    } catch (error) {
      next(error);
    }
  }

  async readAllNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.user.userId) return res.status(401).json({ message: 'Unauthorized' });
      await prisma.notification.updateMany({
        where: { userId: req.user.userId, isRead: false },
        data: { isRead: true }
      });
      res.status(200).json({ message: 'All marked read' });
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

      const fs = require('fs');
      const fileBuffer = fs.readFileSync(req.file.path);
      const base64Image = `data:${req.file.mimetype};base64,${fileBuffer.toString('base64')}`;
      
      // Save Base64 to database
      await prisma.user.update({ where: { id: req.user.userId }, data: { profileImageUrl: base64Image } });
      
      // Delete temporary file
      fs.unlinkSync(req.file.path);
      
      res.json({ profileImageUrl: base64Image });
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
      const { name, email, phone, password, role, status } = req.body;
      const { hashPassword } = require('../utils/hash');

      // Hash the password
      const passwordHash = await hashPassword(password);

      // Split name
      const nameParts = (name || '').split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Map frontend role names to database role names
      let dbRoleName = role;
      if (role === 'Administrator') dbRoleName = 'Admin';
      if (role === 'Veterinarian') dbRoleName = 'Vet';

      // Ensure role exists in the database
      const roleRecord = await prisma.role.upsert({
        where: { name: dbRoleName },
        update: {},
        create: { name: dbRoleName, description: `System ${dbRoleName}` }
      });

      const user = await prisma.user.create({
        data: {
          email,
          phone,
          firstName,
          lastName,
          passwordHash,
          roleId: roleRecord.id,
          isActive: status === 'Active'
        }
      });
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const { name, email, phone, role, status } = req.body;
      
      const dataToUpdate: any = {};
      
      if (name) {
        const nameParts = name.split(' ');
        dataToUpdate.firstName = nameParts[0] || '';
        dataToUpdate.lastName = nameParts.slice(1).join(' ') || '';
      }
      
      if (email) dataToUpdate.email = email;
      if (phone !== undefined) dataToUpdate.phone = phone;
      if (status) dataToUpdate.isActive = status === 'Active';
      
      if (role) {
        let dbRoleName = role;
        if (role === 'Administrator') dbRoleName = 'Admin';
        if (role === 'Veterinarian') dbRoleName = 'Vet';
        const roleRecord = await prisma.role.findUnique({ where: { name: dbRoleName } });
        if (roleRecord) {
          dataToUpdate.roleId = roleRecord.id;
        }
      }

      const user = await prisma.user.update({
        where: { id },
        data: dataToUpdate
      });
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
