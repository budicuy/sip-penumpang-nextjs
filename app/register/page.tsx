import { IconUserPlus, IconLogin } from '@tabler/icons-react';
import Link from 'next/link';

export default function RegisterPage() {
    return (
        <div className='bg-gradient-to-br from-white to-green-400'>
            <div className="container mx-auto h-screen flex items-center justify-center">
                <div className='w-full max-w-lg'>
                    <div className="flex justify-center mb-4 ">
                        <div className='p-6 bg-green-600 rounded-full drop-shadow-2xl'>
                            <IconUserPlus size={48} className="text-white" />
                        </div>
                    </div>
                    <div>
                        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
                            Buat Akun Baru
                        </h2>
                        <p className="mt-2 text-center text-gray-600">
                            Sudah punya akun?{' '}
                            <Link href="/login" className="font-medium text-green-600 hover:text-green-500">
                                Masuk di sini
                            </Link>
                        </p>
                    </div>
                    <form className='mt-5 w-full px-5' method='post'>
                        <div className="rounded-md p-10 bg-white drop-shadow-xl space-y-4">
                            <div>
                                <label htmlFor="name" className="block font-medium text-gray-700 mb-1">Nama Lengkap</label>
                                <input id="name" name="name" type="text" required className="appearance-none rounded-lg relative block w-full px-3 py-3 border placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 border-gray-300" placeholder="Masukkan nama lengkap Anda" />
                            </div>
                            <div>
                                <label htmlFor="email" className="block font-medium text-gray-700 mb-1">Email</label>
                                <input id="email" name="email" type="email" autoComplete="email" required className="appearance-none rounded-lg relative block w-full px-3 py-3 border placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 border-gray-300" placeholder="Masukkan email Anda" />
                            </div>
                            <div>
                                <label htmlFor="password" className="block font-medium text-gray-700 mb-1">Password</label>
                                <input id="password" name="password" type="password" required className="appearance-none rounded-lg relative block w-full px-3 py-3 border placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 border-gray-300" placeholder="Masukkan password Anda" />
                            </div>
                            <div>
                                <button type="submit" className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm font-medium text-white bg-green-600 hover:bg-green-900">
                                    <IconUserPlus className='mr-1' />
                                    <div>Daftar</div>
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
