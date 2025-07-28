'use client';

import { IconUserPlus } from '@tabler/icons-react';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import { toast } from 'react-hot-toast';

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const promise = axios.post('/api/auth/register', { name, email, password })
            .then(() => {
                router.push('/login');
                return 'Pendaftaran berhasil! Anda akan diarahkan ke halaman login.';
            })
            .catch((error) => {
                const axiosError = error as AxiosError<{ error: string }>;
                throw new Error(axiosError.response?.data?.error || 'Pendaftaran gagal');
            });

        toast.promise(promise, {
            loading: 'Mendaftarkan akun...',
            success: (message) => <b>{message}</b>,
            error: (err) => <b>{err.message}</b>,
        }).finally(() => setLoading(false));
    };

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
                    <form className='mt-5 w-full px-5' onSubmit={handleSubmit}>
                        <div className="rounded-md p-10 bg-white drop-shadow-xl space-y-4">
                            <div>
                                <label htmlFor="name" className="block font-medium text-gray-700 mb-1">Nama Lengkap</label>
                                <input id="name" name="name" type="text" required className="appearance-none rounded-lg relative block w-full px-3 py-3 border placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 border-gray-300" placeholder="Masukkan nama lengkap Anda" value={name} onChange={(e) => setName(e.target.value)} />
                            </div>
                            <div>
                                <label htmlFor="email" className="block font-medium text-gray-700 mb-1">Email</label>
                                <input id="email" name="email" type="email" autoComplete="email" required className="appearance-none rounded-lg relative block w-full px-3 py-3 border placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 border-gray-300" placeholder="Masukkan email Anda" value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>
                            <div>
                                <label htmlFor="password" className="block font-medium text-gray-700 mb-1">Password</label>
                                <input id="password" name="password" type="password" required className="appearance-none rounded-lg relative block w-full px-3 py-3 border placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 border-gray-300" placeholder="Masukkan password Anda" value={password} onChange={(e) => setPassword(e.target.value)} />
                            </div>
                            <div>
                                <button type="submit" className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm font-medium text-white bg-green-600 hover:bg-green-900 disabled:bg-green-300" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Processing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <IconUserPlus className='mr-1' />
                                            <div>Daftar</div>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
