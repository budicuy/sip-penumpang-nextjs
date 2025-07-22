import { PrismaClient } from "@prisma/client";
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // Delete existing data
  await prisma.penumpang.deleteMany();
  await prisma.user.deleteMany();

  const penumpangData = [];
  for (let i = 0; i < 1000; i++) {
    const jenisKelamin = faker.helpers.arrayElement(['L', 'P']);
    penumpangData.push({
      nama: faker.person.firstName(),
      usia: faker.number.int({ min: 1, max: 80 }),
      jenisKelamin: jenisKelamin,
      tujuan: faker.helpers.arrayElement(['Pel Tarjun', 'Pel Stagen']),
      tanggal: faker.date.between({ from: '2024-01-01T00:00:00.000Z', to: '2025-12-31T00:00:00.000Z' }),
      nopol: faker.vehicle.vrm(),
      jenisKendaraan: faker.vehicle.vehicle(),
      golongan: faker.helpers.arrayElement(['I', 'II', 'III', 'IVa', 'IVb', 'V', 'VI', 'VII', 'VIII', 'IX']),
      kapal: faker.helpers.arrayElement(['KMF Stagen', 'KMF Tarjun', 'KMF Benua Raya']),
    });
  }

  for (const p of penumpangData) {
    const penumpang = await prisma.penumpang.create({
      data: p,
    });
    console.log(`Created penumpang with ID: ${penumpang.id}` + ` - ${penumpang.nama}`);
  }

  const userData = [
    {
      name: 'Admin',
      email: 'admin@example.com',
      password: 'password', // Pastikan untuk meng-hash password ini di aplikasi Anda
    },
    {
      name: 'User',
      email: 'user@example.com',
      password: 'password', // Pastikan untuk meng-hash password ini di aplikasi Anda
    },
    {
      name: 'manager',
      email: 'manager@example.com',
      password: 'password', // Pastikan untuk meng-hash password ini di aplikasi Anda
    }
  ];

  for (const user of userData) {
    const createdUser = await prisma.user.create({
      data: user,
    });
    console.log(`Created user with ID: ${createdUser.id}` + ` - ${createdUser.name}`);
  }

  console.log('Seeding finished.');


}


main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });