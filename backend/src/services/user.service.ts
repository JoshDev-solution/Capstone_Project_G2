import prisma from '../utils/prisma';

export class UserService {
  async getAllUsers() {
    return await prisma.user.findMany({
      include: {
        role: true,
      },
    });
  }

  async getUserById(id: number) {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
      },
    });
  }

  async getUserByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
      },
    });
  }

  async createUser(data: any) {
    return await prisma.user.create({
      data,
    });
  }

  async updateUser(id: number, data: any) {
    return await prisma.user.update({
      where: { id },
      data,
    });
  }

  async deleteUser(id: number) {
    return await prisma.user.delete({
      where: { id },
    });
  }
}

export const userService = new UserService();
