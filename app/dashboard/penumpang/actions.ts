"use server";

import { Prisma, golongan as GolonganEnum } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z, ZodError } from "zod";
import { authOptions } from "@/app/auth";
import { getServerSession } from "next-auth";
import { prisma } from "@/app/lib/prisma"; // Menggunakan prisma client dengan Accelerate & Optimize

// Skema validasi menggunakan Zod
const penumpangSchema = z.object({
  nama: z.string().min(1, "Nama harus diisi").max(100),
  usia: z.coerce.number().int().min(1, "Usia harus valid").max(150),
  jenisKelamin: z.enum(["L", "P"]),
  tujuan: z.string().min(1, "Tujuan harus diisi"),
  tanggal: z.coerce.date(),
  nopol: z.string().min(1, "No. Polisi harus diisi").max(12),
  jenisKendaraan: z.string().min(1, "Jenis Kendaraan harus diisi").max(50),
  golongan: z.enum(GolonganEnum),
  kapal: z.string().min(1, "Kapal harus diisi"),
});

export type FormState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[] | undefined>;
};

async function getUserId(): Promise<string> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Otentikasi gagal. Silakan login kembali.");
  }
  return session.user.id;
}

export async function tambahPenumpang(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    const userId = await getUserId();
    const rawData = Object.fromEntries(formData.entries());
    const validatedData = penumpangSchema.parse(rawData);

    await prisma.penumpang.create({
      data: {
        ...validatedData,
        userId,
        nopol: validatedData.nopol.toUpperCase().replace(/\s+/g, " ").trim(),
      },
    });

    revalidatePath("/dashboard/penumpang");
    return { success: true, message: "Data penumpang berhasil ditambahkan." };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        message: "Validasi gagal.",
        errors: error.flatten().fieldErrors,
      };
    }
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { success: false, message: "Data duplikat terdeteksi." };
    }
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Gagal menambahkan data.",
    };
  }
}

export async function updatePenumpang(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const idRaw = formData.get("id");
  if (!idRaw) {
    return { success: false, message: "ID Penumpang tidak valid." };
  }
  const id = parseInt(idRaw as string, 10);

  try {
    await getUserId(); // Cek otentikasi
    const rawData = Object.fromEntries(formData.entries());
    const validatedData = penumpangSchema.parse(rawData);

    await prisma.penumpang.update({
      where: { id },
      data: {
        ...validatedData,
        nopol: validatedData.nopol.toUpperCase().replace(/\s+/g, " ").trim(),
      },
    });

    revalidatePath("/dashboard/penumpang");
    return { success: true, message: "Data penumpang berhasil diperbarui." };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        message: "Validasi gagal.",
        errors: error.flatten().fieldErrors,
      };
    }
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Gagal memperbarui data.",
    };
  }
}

export async function hapusPenumpang(id: number): Promise<FormState> {
  try {
    await getUserId();
    await prisma.penumpang.delete({ where: { id } });
    revalidatePath("/dashboard/penumpang");
    return { success: true, message: "Data berhasil dihapus." };
  } catch {
    return {
      success: false,
      message: "Gagal menghapus data.",
    };
  }
}

export async function hapusPenumpangTerpilih(
  ids: number[],
): Promise<FormState> {
  try {
    await getUserId();
    const deletePromises = ids.map((id) =>
      prisma.penumpang.delete({ where: { id } }),
    );
    await prisma.$transaction(deletePromises);

    revalidatePath("/dashboard/penumpang");
    return {
      success: true,
      message: `${ids.length} data berhasil dihapus.`,
    };
  } catch {
    return {
      success: false,
      message: "Gagal menghapus data yang dipilih.",
    };
  }
}
