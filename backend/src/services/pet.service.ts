import prisma from '../utils/prisma';

export class PetService {
  async getAllPets() {
    return await prisma.pet.findMany({
      include: {
        client: true,
        petType: true,
        breed: true,
      },
    });
  }

  async getPetById(id: number) {
    return await prisma.pet.findUnique({
      where: { id },
      include: {
        client: true,
        petType: true,
        breed: true,
        appointments: true,
      },
    });
  }

  async createPet(data: any) {
    return await prisma.pet.create({
      data,
    });
  }

  async updatePet(id: number, data: any) {
    return await prisma.pet.update({
      where: { id },
      data,
    });
  }

  async deletePet(id: number) {
    return await prisma.pet.delete({
      where: { id },
    });
  }
}

export const petService = new PetService();
