// types/next-auth.d.ts

import { Role } from "@prisma/client";
import { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

/**
 * Mendeklarasikan modul untuk "next-auth/jwt".
 * Ini memperluas tipe JWT bawaan untuk menyertakan properti kustom Anda.
 */
declare module "next-auth/jwt" {
    /** Dikembalikan oleh callback `jwt` dan fungsi `getToken` */
    interface JWT {
        id: string;
        role: Role;
    }
}

/**
 * Mendeklarasikan modul untuk "next-auth".
 * Ini memungkinkan Anda untuk menambahkan properti kustom ke objek Session dan User.
 */
declare module "next-auth" {
    /**
     * Tipe ini mendefinisikan bentuk data yang dikembalikan oleh `useSession`, `getSession`,
     * dan diterima sebagai prop oleh `SessionProvider`.
     */
    interface Session {
        user: {
            id: string;
            role: Role;
        } & DefaultSession["user"]; // Menggabungkan dengan tipe user default
    }

    /**
     * Tipe User yang diperluas.
     * Anda bisa menambahkan properti lain di sini jika diperlukan di masa depan.
     */
    interface User extends DefaultUser {
        role: Role;
    }
}
