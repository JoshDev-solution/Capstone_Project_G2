import prisma from '../utils/prisma';

export class ReportService {
  async getAll() {
    return await prisma.report.findMany();
  }

  async getById(id: number) {
    return await prisma.report.findUnique({
      where: { id },
    });
  }

  async create(data: any) {
    return await prisma.report.create({
      data,
    });
  }

  async update(id: number, data: any) {
    return await prisma.report.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    return await prisma.report.delete({
      where: { id },
    });
  }
}

export const reportService = new ReportService();
