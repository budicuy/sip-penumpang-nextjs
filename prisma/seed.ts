import { PrismaClient, JenisKelamin } from '../app/generated/prisma';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  await prisma.penumpang.deleteMany({});

  const penumpangData = [];
  for (let i = 0; i < 200; i++) {
    const jenisKelamin = faker.helpers.arrayElement([JenisKelamin.L, JenisKelamin.P]);
    penumpangData.push({
      nama: faker.person.fullName(),
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
    console.log(`Created penumpang with id: ${penumpang.id}`);
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