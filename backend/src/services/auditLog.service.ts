import prisma from '../utils/prisma';

export class AuditLogService {
  async getAll() {
    return await prisma.auditLog.findMany();
  }

  async getById(id: number) {
    return await prisma.auditLog.findUnique({
      where: { id },
    });
  }

  async create(data: any) {
    return await prisma.auditLog.create({
      data,
    });
  }

  async update(id: number, data: any) {
    return await prisma.auditLog.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    return await prisma.auditLog.delete({
      where: { id },
    });
  }
}

export const auditLogService = new AuditLogService();
