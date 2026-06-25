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
        client: { include: { user: true } },
        petType: true,
        breed: true,
        appointments: true,
      },
    });
  }

  async getPetHistory(id: number) {
    return await prisma.pet.findUnique({
      where: { id },
      include: {
        client: { include: { user: true } },
        petType: true,
        breed: true,
        consultations: {
          include: {
            vet: { include: { user: true } },
            diagnoses: true,
            prescriptions: {
              include: { items: true }
            },
            medicalRecords: true
          },
          orderBy: { consultationDate: 'desc' }
        },
        medicalRecords: {
          where: { consultationId: null }, // Only records not attached to a consultation
          orderBy: { recordDate: 'desc' }
        }
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
