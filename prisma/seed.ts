
import { PrismaClient, JenisKelamin } from '../app/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  const penumpangData = [
    {
      nama: 'Budi Santoso',
      usia: 35,
      jenisKelamin: JenisKelamin.L,
      tujuan: 'Pel Tarjun',
      tanggal: new Date('2025-07-23T10:00:00Z'),
      nopol: 'DA 1234 ABC',
      jenisKendaraan: 'Toyota Avanza',
      golongan: 'IVa',
      kapal: 'KMF Stagen',
    },
    {
      nama: 'Siti Aminah',
      usia: 28,
      jenisKelamin: JenisKelamin.P,
      tujuan: 'Pel Stagen',
      tanggal: new Date('2025-07-23T10:15:00Z'),
      nopol: 'KH 5678 DEF',
      jenisKendaraan: 'Honda Scoopy',
      golongan: 'II',
      kapal: 'KMF Tarjun',
    },
    {
      nama: 'Joko Susilo',
      usia: 45,
      jenisKelamin: JenisKelamin.L,
      tujuan: 'Pel Tarjun',
      tanggal: new Date('2025-07-24T11:00:00Z'),
      nopol: 'B 9012 GHI',
      jenisKendaraan: 'Mitsubishi Pajero',
      golongan: 'IVb',
      kapal: 'KMF Benua Raya',
    },
    {
      nama: 'Dewi Lestari',
      usia: 22,
      jenisKelamin: JenisKelamin.P,
      tujuan: 'Pel Stagen',
      tanggal: new Date('2025-07-24T11:30:00Z'),
      nopol: 'AG 3456 JKL',
      jenisKendaraan: 'Yamaha NMAX',
      golongan: 'II',
      kapal: 'KMF Stagen',
    },
    {
        nama: 'Ahmad Yani',
        usia: 52,
        jenisKelamin: JenisKelamin.L,
        tujuan: 'Pel Tarjun',
        tanggal: new Date('2025-07-25T09:00:00Z'),
        nopol: 'D 7890 MNO',
        jenisKendaraan: 'Truk Fuso',
        golongan: 'V',
        kapal: 'KMF Tarjun',
    }
  ];

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
