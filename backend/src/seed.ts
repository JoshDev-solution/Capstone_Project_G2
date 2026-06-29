import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient({});

async function main() {
  console.log('Seeding database...');
  const passwordHash = await bcrypt.hash('password123', 10);

  // Clear existing related data to avoid conflicts on re-run
  try {
    await prisma.chatRequest.deleteMany({});
    await prisma.message.deleteMany({});
    await prisma.chatbotLog.deleteMany({});
    await prisma.activityLog.deleteMany({});
    await prisma.auditLog.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.report.deleteMany({});
    await prisma.inventoryTransaction.deleteMany({});
    await prisma.refund.deleteMany({});
    await prisma.payment.deleteMany({});
    await prisma.billItem.deleteMany({});
    await prisma.bill.deleteMany({});
    await prisma.prescriptionItem.deleteMany({});
    await prisma.prescription.deleteMany({});
    await prisma.diagnosis.deleteMany({});
    await prisma.medicalRecord.deleteMany({});
    await prisma.consultation.deleteMany({});
    await prisma.appointment.deleteMany({});
    await prisma.inventory.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.pet.deleteMany({});
    await prisma.service.deleteMany({});
  } catch (err) {
    console.log('Warning during cleanup: ', err);
  }

  // 1. Roles
  const roles = [
    { name: 'Admin', description: 'System Administrator' },
    { name: 'Vet', description: 'Veterinarian' },
    { name: 'Client', description: 'Pet Owner' },
    { name: 'Manager', description: 'Clinic Manager' },
    { name: 'Cashier', description: 'Billing and POS Cashier' }
  ];
  
  const createdRoles: Record<string, any> = {};
  for (const r of roles) {
    createdRoles[r.name] = await prisma.role.upsert({
      where: { name: r.name },
      update: {},
      create: r,
    });
  }

  // 2. Staff Users
  const staffUsersData = [
    { email: 'admin@ljvetclinic.com', firstName: 'System', lastName: 'Admin', roleId: createdRoles['Admin'].id, phone: '1234567890' },
    { email: 'dr.smith@ljvetclinic.com', firstName: 'Sarah', lastName: 'Smith', roleId: createdRoles['Vet'].id, phone: '0987654321' },
    { email: 'manager@ljvetclinic.com', firstName: 'Operations', lastName: 'Manager', roleId: createdRoles['Manager'].id, phone: '4445556666' },
    { email: 'cashier@ljvetclinic.com', firstName: 'Frontdesk', lastName: 'Cashier', roleId: createdRoles['Cashier'].id, phone: '7778889999' },
    { email: 'dr.jones@ljvetclinic.com', firstName: 'Tom', lastName: 'Jones', roleId: createdRoles['Vet'].id, phone: '5556667777' }
  ];

  for (const su of staffUsersData) {
    const user = await prisma.user.upsert({
      where: { email: su.email },
      update: {},
      create: { ...su, passwordHash, isActive: true, emailVerified: true },
    });
    
    await prisma.staff.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id }
    });
  }

  // 3. Client Users & Clients
  const clientData = [
    { email: 'johndoe@example.com', firstName: 'John', lastName: 'Doe', code: 'CLI-001' },
    { email: 'janesmith@example.com', firstName: 'Jane', lastName: 'Smith', code: 'CLI-002' },
    { email: 'bobwilson@example.com', firstName: 'Bob', lastName: 'Wilson', code: 'CLI-003' },
    { email: 'alicebrown@example.com', firstName: 'Alice', lastName: 'Brown', code: 'CLI-004' },
    { email: 'charliedavis@example.com', firstName: 'Charlie', lastName: 'Davis', code: 'CLI-005' },
    { email: 'joshuaparcon@gmail.com', firstName: 'Joshua', lastName: 'Parcon', code: 'CLI-006' }
  ];

  const createdClients = [];
  for (const c of clientData) {
    const user = await prisma.user.upsert({
      where: { email: c.email },
      update: {},
      create: {
        email: c.email, passwordHash, firstName: c.firstName, lastName: c.lastName,
        roleId: createdRoles['Client'].id, isActive: true, emailVerified: true
      }
    });

    const client = await prisma.client.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, clientCode: c.code, emergencyContactName: 'Emergency Contact', emergencyContactPhone: '9998887777' }
    });
    createdClients.push(client);
  }

  // 4. Pet Types & Breeds
  const petTypes = ['Dog', 'Cat', 'Bird', 'Rabbit', 'Hamster'];
  const createdPetTypes = [];
  for (const pt of petTypes) {
    createdPetTypes.push(await prisma.petType.upsert({ where: { name: pt }, update: {}, create: { name: pt } }));
  }

  const breeds = ['Golden Retriever', 'Persian', 'Parrot', 'Lop', 'Syrian', 'Bulldog'];
  const createdBreeds = [];
  for (const b of breeds) {
    createdBreeds.push(await prisma.breed.upsert({ where: { name: b }, update: {}, create: { name: b } }));
  }

  // 5. Pets (at least 5)
  const petsToCreate = [
    { name: 'Buster', clientId: createdClients[0].id, petTypeId: createdPetTypes[0].id, breedId: createdBreeds[0].id, sex: 'Male' },
    { name: 'Luna', clientId: createdClients[1].id, petTypeId: createdPetTypes[1].id, breedId: createdBreeds[1].id, sex: 'Female' },
    { name: 'Tweety', clientId: createdClients[2].id, petTypeId: createdPetTypes[2].id, breedId: createdBreeds[2].id, sex: 'Male' },
    { name: 'Thumper', clientId: createdClients[3].id, petTypeId: createdPetTypes[3].id, breedId: createdBreeds[3].id, sex: 'Male' },
    { name: 'Nibbles', clientId: createdClients[4].id, petTypeId: createdPetTypes[4].id, breedId: createdBreeds[4].id, sex: 'Female' }
  ];

  const createdPets = [];
  for (const p of petsToCreate) {
    createdPets.push(await prisma.pet.create({
      data: { ...p, birthDate: new Date('2020-01-01'), weightKg: 10 }
    }));
  }

  // 6. Services
  const services = ['General Checkup', 'Vaccination', 'Surgery', 'Dental Cleaning', 'Grooming'];
  const createdServices = [];
  for (const s of services) {
    createdServices.push(await prisma.service.create({
      data: { name: s, price: 50.00, duration: 30 }
    }));
  }

  // 7. Products & Categories
  const categories = ['Medication', 'Food', 'Accessories', 'Supplements', 'Grooming Supplies'];
  const createdCategories = [];
  for (const c of categories) {
    createdCategories.push(await prisma.category.upsert({
      where: { name: c }, update: {}, create: { name: c }
    }));
  }

  const products = [
    { name: 'Antibiotics', categoryId: createdCategories[0].id, sku: 'PROD-001', price: 20 },
    { name: 'Premium Dog Food', categoryId: createdCategories[1].id, sku: 'PROD-002', price: 60 },
    { name: 'Nylon Collar', categoryId: createdCategories[2].id, sku: 'PROD-003', price: 15 },
    { name: 'Vitamin C', categoryId: createdCategories[3].id, sku: 'PROD-004', price: 25 },
    { name: 'Pet Shampoo', categoryId: createdCategories[4].id, sku: 'PROD-005', price: 12 }
  ];
  const createdProducts = [];
  for (const p of products) {
    const prod = await prisma.product.create({ data: p });
    await prisma.inventory.create({ data: { productId: prod.id, quantity: 100 } });
    createdProducts.push(prod);
  }

  // Fetch a vet staff
  const vetStaff = await prisma.staff.findFirst({ where: { user: { roleId: createdRoles['Vet'].id } } });

  if (!vetStaff) throw new Error("No vet staff found");

  // 8. Appointments
  const appointmentsData = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    appointmentsData.push({
      appointmentCode: `APT-00${i+1}`,
      clientId: createdPets[i].clientId,
      petId: createdPets[i].id,
      vetId: vetStaff.id,
      serviceId: createdServices[i].id,
      appointmentDate: d,
      appointmentTime: d,
      status: 'Completed',
      reason: 'Regular visit'
    });
  }

  const today = new Date();
  appointmentsData.push({
    appointmentCode: `APT-EMG-001`,
    clientId: createdPets[0].clientId,
    petId: createdPets[0].id,
    vetId: vetStaff.id,
    serviceId: createdServices[2].id,
    appointmentDate: today,
    appointmentTime: today,
    status: 'Scheduled',
    type: 'Emergency',
    reason: 'Hit by car'
  });

  appointmentsData.push({
    appointmentCode: `APT-TDA-002`,
    clientId: createdPets[1].clientId,
    petId: createdPets[1].id,
    vetId: vetStaff.id,
    serviceId: createdServices[0].id,
    appointmentDate: today,
    appointmentTime: today,
    status: 'Arrived',
    type: 'Scheduled',
    reason: 'Vomiting'
  });

  const createdAppointments = [];
  for (const a of appointmentsData) {
    createdAppointments.push(await prisma.appointment.create({ data: a }));
  }

  // 9. Consultations, Diagnoses, Prescriptions, Medical Records, Bills
  for (let i = 0; i < 5; i++) {
    const apt = createdAppointments[i];
    const petId = apt.petId;
    
    // Consultation
    const cons = await prisma.consultation.create({
      data: {
        appointmentId: apt.id,
        petId: petId,
        vetId: vetStaff.id,
        weightKg: 10 + i,
        chiefComplaint: 'Checkup',
        clinicalFindings: 'Healthy'
      }
    });

    // Medical Record
    await prisma.medicalRecord.create({
      data: {
        petId: petId,
        consultationId: cons.id,
        recordType: 'Visit Notes',
        title: 'Routine Examination',
        description: 'Pet is doing well.'
      }
    });

    // Diagnosis
    await prisma.diagnosis.create({
      data: {
        consultationId: cons.id,
        petId: petId,
        vetId: vetStaff.id,
        diagnosisText: 'Healthy, no abnormalities found.',
        severity: 'Low'
      }
    });

    // Prescription
    const presc = await prisma.prescription.create({
      data: {
        consultationId: cons.id,
        petId: petId,
        vetId: vetStaff.id,
        prescriptionCode: `RX-00${i+1}`,
      }
    });

    await prisma.prescriptionItem.create({
      data: {
        prescriptionId: presc.id,
        medicationName: createdProducts[0].name,
        dosage: '1 tablet',
        frequency: 'Once a day'
      }
    });

    // Bill
    const bill = await prisma.bill.create({
      data: {
        billCode: `BILL-00${i+1}`,
        clientId: apt.clientId,
        petId: petId,
        appointmentId: apt.id,
        status: 'Paid',
        totalAmount: createdServices[i].price
      }
    });

    await prisma.billItem.create({
      data: {
        billId: bill.id,
        itemType: 'Service',
        serviceId: createdServices[i].id,
        description: createdServices[i].name,
        quantity: 1,
        unitPrice: createdServices[i].price,
        totalPrice: createdServices[i].price
      }
    });
  }

  // Add Vaccination and Deworming records
  await prisma.medicalRecord.create({
    data: {
      petId: createdPets[0].id,
      recordType: 'Vaccination',
      title: 'Rabies Vaccine',
      description: 'Annual Rabies shot administered.',
      recordDate: new Date('2025-05-01')
    }
  });

  await prisma.medicalRecord.create({
    data: {
      petId: createdPets[1].id,
      recordType: 'Deworming',
      title: 'Broad-spectrum Dewormer',
      description: 'Administered oral deworming suspension.',
      recordDate: new Date('2026-04-15')
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
