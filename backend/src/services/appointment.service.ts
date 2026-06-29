import prisma from '../utils/prisma';

export class AppointmentService {
  async getAllAppointments() {
    return await prisma.appointment.findMany({
      include: {
        pet: { include: { petType: true, breed: true } },
        client: { include: { user: true } },
        vet: { include: { user: true } },
        service: true,
      },
    });
  }

  async getAppointmentById(id: number) {
    return await prisma.appointment.findUnique({
      where: { id },
      include: {
        pet: { include: { petType: true, breed: true } },
        client: { include: { user: true } },
        vet: { include: { user: true } },
        service: true,
      },
    });
  }

  async createAppointment(data: any) {
    return await prisma.appointment.create({
      data,
    });
  }

  async updateAppointment(id: number, data: any) {
    return await prisma.appointment.update({
      where: { id },
      data,
    });
  }

  async deleteAppointment(id: number) {
    return await prisma.appointment.delete({
      where: { id },
    });
  }
}

export const appointmentService = new AppointmentService();
