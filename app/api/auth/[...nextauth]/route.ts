import NextAuth from "next-auth";
import { authOptions } from "@/app/lib/auth"; // 1. Impor konfigurasi dari file baru

// 2. Buat handler menggunakan konfigurasi yang diimpor
const handler = NextAuth(authOptions);

// 3. Ekspor handler untuk metode GET dan POST (ini adalah ekspor yang valid)
export { handler as GET, handler as POST };
