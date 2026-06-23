import prisma from '../utils/prisma';

export class ChatbotLogService {
  async getAll() {
    return await prisma.chatbotLog.findMany();
  }

  async getById(id: number) {
    return await prisma.chatbotLog.findUnique({
      where: { id },
    });
  }

  async create(data: any) {
    return await prisma.chatbotLog.create({
      data,
    });
  }

  async update(id: number, data: any) {
    return await prisma.chatbotLog.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    return await prisma.chatbotLog.delete({
      where: { id },
    });
  }
}

export const chatbotLogService = new ChatbotLogService();
