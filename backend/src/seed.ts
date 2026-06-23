import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {},
    create: { name: 'Admin', description: 'System Administrator' },
  });
  
  const vetRole = await prisma.role.upsert({
    where: { name: 'Vet' },
    update: {},
    create: { name: 'Vet', description: 'Veterinarian' },
  });

  const clientRole = await prisma.role.upsert({
    where: { name: 'Client' },
    update: {},
    create: { name: 'Client', description: 'Pet Owner' },
  });

  // 2. Users
  const passwordHash = await bcrypt.hash('password123', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@ljvetclinic.com' },
    update: {},
    create: {
      email: 'admin@ljvetclinic.com',
      passwordHash,
      firstName: 'System',
      lastName: 'Admin',
      phone: '1234567890',
      roleId: adminRole.id,
      isActive: true,
      emailVerified: true
    },
  });

  const vetUser = await prisma.user.upsert({
    where: { email: 'dr.smith@ljvetclinic.com' },
    update: {},
    create: {
      email: 'dr.smith@ljvetclinic.com',
      passwordHash,
      firstName: 'Sarah',
      lastName: 'Smith',
      phone: '0987654321',
      roleId: vetRole.id,
      isActive: true,
      emailVerified: true
    },
  });

  const clientUser = await prisma.user.upsert({
    where: { email: 'johndoe@example.com' },
    update: {},
    create: {
      email: 'johndoe@example.com',
      passwordHash,
      firstName: 'John',
      lastName: 'Doe',
      phone: '1112223333',
      roleId: clientRole.id,
      isActive: true,
      emailVerified: true
    },
  });

  // 3. Staff & Client records
  await prisma.staff.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id
    }
  });

  const vetStaff = await prisma.staff.upsert({
    where: { userId: vetUser.id },
    update: {},
    create: {
      userId: vetUser.id
    }
  });

  const clientRecord = await prisma.client.upsert({
    where: { userId: clientUser.id },
    update: {},
    create: {
      userId: clientUser.id,
      clientCode: 'CLI-001',
      emergencyContactName: 'Jane Doe',
      emergencyContactPhone: '1112223333',
    }
  });

  // 4. Pet Types & Breeds
  const dogType = await prisma.petType.upsert({
    where: { name: 'Dog' },
    update: {},
    create: { name: 'Dog' }
  });

  const catType = await prisma.petType.upsert({
    where: { name: 'Cat' },
    update: {},
    create: { name: 'Cat' }
  });

  const goldenRetriever = await prisma.breed.upsert({
    where: { name: 'Golden Retriever' },
    update: {},
    create: { name: 'Golden Retriever' }
  });

  const persianCat = await prisma.breed.upsert({
    where: { name: 'Persian' },
    update: {},
    create: { name: 'Persian' }
  });

  // 5. Pets
  const petBuster = await prisma.pet.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Buster',
      clientId: clientRecord.id,
      petTypeId: dogType.id,
      breedId: goldenRetriever.id,
      birthDate: new Date('2020-01-01'),
      sex: 'Male',
      weightKg: 30.5
    }
  });

  // 6. Services (Using create since name isn't marked unique)
  // Delete existing ones just in case to prevent duplicates during testing
  await prisma.service.deleteMany({});
  
  const generalCheckup = await prisma.service.create({
    data: {
      name: 'General Checkup',
    }
  });

  // 7. Appointments
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  await prisma.appointment.upsert({
    where: { appointmentCode: 'APT-001' },
    update: {},
    create: {
      appointmentCode: 'APT-001',
      clientId: clientRecord.id,
      petId: petBuster.id,
      vetId: vetStaff.id,
      serviceId: generalCheckup.id,
      appointmentDate: tomorrow,
      appointmentTime: tomorrow, // Using datetime for time as requested by schema
      status: 'Scheduled',
      reason: 'Annual vaccination and checkup'
    }
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
