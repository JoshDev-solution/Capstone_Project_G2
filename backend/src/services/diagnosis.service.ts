import prisma from '../utils/prisma';

export class DiagnosisService {
  async getAllDiagnoses() {
    return await prisma.diagnosis.findMany({
      include: {
        consultation: true,
        pet: true,
        vet: true,
      },
    });
  }

  async getDiagnosisById(id: number) {
    return await prisma.diagnosis.findUnique({
      where: { id },
      include: {
        consultation: true,
        pet: true,
        vet: true,
      },
    });
  }

  async createDiagnosis(data: any) {
    return await prisma.diagnosis.create({
      data,
    });
  }

  async updateDiagnosis(id: number, data: any) {
    return await prisma.diagnosis.update({
      where: { id },
      data,
    });
  }

  async deleteDiagnosis(id: number) {
    return await prisma.diagnosis.delete({
      where: { id },
    });
  }
}

export const diagnosisService = new DiagnosisService();
