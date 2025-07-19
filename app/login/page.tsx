import { IconUser, IconLogin } from '@tabler/icons-react';
import Link from 'next/dist/client/link';

export default function LoginPage() {
    return (
        <div className='bg-gradient-to-br from-white to-blue-400'>
            <div className="container mx-auto h-screen flex items-center justify-center">
                <div className='w-full max-w-lg'>
                    <div className="flex justify-center mb-4 ">
                        <div className='p-6 bg-blue-600 rounded-full drop-shadow-2xl'>
                            <IconUser size={48} className="text-white" />
                        </div>
                    </div>
                    <div>
                        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
                            Masuk ke Akun Anda
                        </h2>
                        <p className="mt-2 text-center  text-gray-600">
                            Masuk atau buat <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
                                akun baru
                            </Link> untuk melanjutkan


                        </p>
                    </div>
                    <form className='mt-5 w-full px-5' method='post'>
                        <div className="rounded-md p-10 bg-white drop-shadow-xl space-y-4">
                            <div>
                                <label htmlFor="email" className="block  font-medium text-gray-700 mb-1">Email</label>
                                <input id="email" name="email" type="email" autoComplete="email" className="appearance-none rounded-lg relative block w-full px-3 py-3 border placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 border-gray-300" placeholder="Masukkan email Anda" value="admin@example.com" />
                            </div>
                            <div>
                                <label htmlFor="password" className="block  font-medium text-gray-700 mb-1">Password</label>
                                <input id="password" name="password" type="password" className="appearance-none rounded-lg relative block w-full px-3 py-3 border placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 border-gray-300" placeholder="Masukkan password Anda" value="password" />
                            </div>
                            {/* remember me */}
                            <div className="flex items-center">
                                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                                <label htmlFor="remember-me" className="ml-2 block  text-gray-900x">
                                    Ingat saya
                                </label>
                            </div>
                            <div>
                                <Link href='/dashboard'>
                                    <button type="button" className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm  font-medium text-white bg-blue-600 hover:bg-blue-950">
                                        <IconLogin className='mr-1' />
                                        <div>Masuk</div>
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
