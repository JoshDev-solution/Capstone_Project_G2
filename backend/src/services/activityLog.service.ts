import prisma from '../utils/prisma';

export class ActivityLogService {
  async getAll() {
    return await prisma.activityLog.findMany();
  }

  async getById(id: number) {
    return await prisma.activityLog.findUnique({
      where: { id },
    });
  }

  async create(data: any) {
    return await prisma.activityLog.create({
      data,
    });
  }

  async update(id: number, data: any) {
    return await prisma.activityLog.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    return await prisma.activityLog.delete({
      where: { id },
    });
  }
}

export const activityLogService = new ActivityLogService();
