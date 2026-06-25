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
    return await prisma.$transaction(async (tx) => {
      // 1. Create the consultation (which may include nested diagnoses and prescriptions)
      const consultation = await tx.consultation.create({
        data,
      });

      // 2. Update the appointment status to Completed
      if (data.appointmentId) {
        await tx.appointment.update({
          where: { id: data.appointmentId },
          data: { 
            status: 'Completed',
            completedAt: new Date()
          }
        });
      }

      return consultation;
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
