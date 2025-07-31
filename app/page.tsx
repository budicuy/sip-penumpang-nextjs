import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";
import Image from "next/image";

export default function Home() {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-blue-900 text-white min-h-screen flex flex-col">
      <header className="sticky top-0 z-20 bg-gray-900/50 backdrop-blur-lg">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-lg md:text-2xl font-bold font-quicksand">MANIFES PEL.TARJUN</h1>
          <nav className="s`pace-x-4">
            <Link href="/login" className="px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors">
              Login
            </Link>
            <Link href="/register" className="bg-blue-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
              Register
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-6 flex-grow flex items-center">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="text-center md:text-left">
            <h2 className="text-4xl md:text-6xl font-bold font-poppins leading-tight">
              Sistem Informasi <span className="text-blue-400">Manajemen Penumpang</span>
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              Kelola data penumpang dengan efisien, cepat, dan aman. Akses informasi penting di mana saja dan kapan saja.
            </p>
            <div className="mt-8 flex justify-center md:justify-start space-x-4">
              <Link href="/dashboard" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center">
                Mulai Sekarang <IconArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link href="#" className="border border-gray-600 text-gray-300 px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 hover:border-gray-500 transition-all duration-300">
                Pelajari Lebih Lanjut
              </Link>
            </div>
          </div>
          <div className="relative hidden md:block">
            <div className="absolute -top-16 -right-10 w-72 h-72 bg-blue-500 rounded-full opacity-30 blur-3xl animate-blob"></div>
            <div className="absolute -bottom-24 left-10 w-72 h-72 bg-green-500 rounded-full opacity-30 blur-3xl animate-blob animation-delay-2000"></div>
            <div className="relative z-10 p-8 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl">
              <Image src="/vercel.svg" alt="Globe" width={300} height={300} className="mx-auto" />
            </div>
          </div>
        </div>
      </main >

      <footer className="container mx-auto px-6 py-4 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} SIP-PENUMPANG. All rights reserved.</p>
      </footer>
    </div >
  );
}
