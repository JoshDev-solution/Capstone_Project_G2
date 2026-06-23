import prisma from '../utils/prisma';

export class PrescriptionService {
  async getAllPrescriptions() {
    return await prisma.prescription.findMany({
      include: {
        consultation: true,
        pet: true,
        vet: true,
        items: true,
      },
    });
  }

  async getPrescriptionById(id: number) {
    return await prisma.prescription.findUnique({
      where: { id },
      include: {
        consultation: true,
        pet: true,
        vet: true,
        items: true,
      },
    });
  }

  async createPrescription(data: any) {
    return await prisma.prescription.create({
      data,
    });
  }

  async updatePrescription(id: number, data: any) {
    return await prisma.prescription.update({
      where: { id },
      data,
    });
  }

  async deletePrescription(id: number) {
    return await prisma.prescription.delete({
      where: { id },
    });
  }
}

export const prescriptionService = new PrescriptionService();
