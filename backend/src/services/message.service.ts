import prisma from '../utils/prisma';

export class MessageService {
  async getAll() {
    return await prisma.message.findMany();
  }

  async getById(id: number) {
    return await prisma.message.findUnique({
      where: { id },
    });
  }

  async create(data: any) {
    return await prisma.message.create({
      data,
    });
  }

  async update(id: number, data: any) {
    return await prisma.message.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    return await prisma.message.delete({
      where: { id },
    });
  }
}

export const messageService = new MessageService();
