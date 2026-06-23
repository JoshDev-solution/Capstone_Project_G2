import prisma from '../utils/prisma';

export class NotificationService {
  async getAll() {
    return await prisma.notification.findMany();
  }

  async getById(id: number) {
    return await prisma.notification.findUnique({
      where: { id },
    });
  }

  async create(data: any) {
    return await prisma.notification.create({
      data,
    });
  }

  async update(id: number, data: any) {
    return await prisma.notification.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    return await prisma.notification.delete({
      where: { id },
    });
  }
}

export const notificationService = new NotificationService();
