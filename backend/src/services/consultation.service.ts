import prisma from '../utils/prisma';

export class ConsultationService {
  async getAllConsultations() {
    return await prisma.consultation.findMany({
      include: {
        appointment: true,
        pet: true,
        vet: true,
      },
    });
  }

  async getConsultationById(id: number) {
    return await prisma.consultation.findUnique({
      where: { id },
      include: {
        appointment: true,
        pet: true,
        vet: true,
        diagnoses: true,
        prescriptions: true,
        medicalRecords: true,
      },
    });
  }

  async createConsultation(data: any) {
    return await prisma.consultation.create({
      data,
    });
  }

  async updateConsultation(id: number, data: any) {
    return await prisma.consultation.update({
      where: { id },
      data,
    });
  }

  async deleteConsultation(id: number) {
    return await prisma.consultation.delete({
      where: { id },
    });
  }
}

export const consultationService = new ConsultationService();
