import prisma from '../utils/prisma';

export class ClientService {
  async getAllClients() {
    return await prisma.client.findMany({
      include: {
        user: true,
        pets: true,
      },
    });
  }

  async getClientById(id: number) {
    return await prisma.client.findUnique({
      where: { id },
      include: {
        user: true,
        pets: true,
        appointments: true,
      },
    });
  }

  async createClient(data: any) {
    return await prisma.client.create({
      data,
    });
  }

  async updateClient(id: number, data: any) {
    return await prisma.client.update({
      where: { id },
      data,
    });
  }

  async deleteClient(id: number) {
    return await prisma.client.delete({
      where: { id },
    });
  }
}

export const clientService = new ClientService();
