import prisma from '../utils/prisma';

export class MedicalRecordService {
  async getAllMedicalRecords() {
    return await prisma.medicalRecord.findMany({
      include: {
        pet: true,
        consultation: true,
      },
    });
  }

  async getMedicalRecordById(id: number) {
    return await prisma.medicalRecord.findUnique({
      where: { id },
      include: {
        pet: true,
        consultation: true,
      },
    });
  }

  async createMedicalRecord(data: any) {
    return await prisma.medicalRecord.create({
      data,
    });
  }

  async updateMedicalRecord(id: number, data: any) {
    return await prisma.medicalRecord.update({
      where: { id },
      data,
    });
  }

  async deleteMedicalRecord(id: number) {
    return await prisma.medicalRecord.delete({
      where: { id },
    });
  }
}

export const medicalRecordService = new MedicalRecordService();
