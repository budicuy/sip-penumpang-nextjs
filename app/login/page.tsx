'use client';

import { IconUser, IconLogin } from '@tabler/icons-react';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('admin@example.com');
    const [password, setPassword] = useState('password');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post('/api/auth/login', { email, password });
            if (response.data.success) {
                router.push('/dashboard');
            } else {
                setError(response.data.error || 'Login gagal');
            }
        } catch (error) {
            const axiosError = error as AxiosError<{ error: string }>;
            setError(axiosError.response?.data?.error || 'Login gagal');
        } finally {
            setLoading(false);
        }
    };


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
                    <form className='mt-5 w-full px-5' onSubmit={handleSubmit}>
                        <div className="rounded-md p-10 bg-white drop-shadow-xl space-y-4">
                            {error && <p className="text-red-500 text-center">{error}</p>}
                            <div>
                                <label htmlFor="email" className="block  font-medium text-gray-700 mb-1">Email</label>
                                <input id="email" name="email" type="email" className="appearance-none rounded-lg relative block w-full px-3 py-3 border placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 border-gray-300" placeholder="Masukkan email Anda" value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>
                            <div>
                                <label htmlFor="password" className="block  font-medium text-gray-700 mb-1">Password</label>
                                <input id="password" name="password" type="password" className="appearance-none rounded-lg relative block w-full px-3 py-3 border placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 border-gray-300" placeholder="Masukkan password Anda" value={password} onChange={(e) => setPassword(e.target.value)} />
                            </div>
                            {/* remember me */}
                            <div className="flex items-center">
                                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                                <label htmlFor="remember-me" className="ml-2 block  text-gray-900x">
                                    Ingat saya
                                </label>
                            </div>
                            <div>
                                <button type="submit" className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm  font-medium text-white bg-blue-600 hover:bg-blue-950 disabled:bg-blue-300" disabled={loading}>
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
                                            <IconLogin className='mr-1' />
                                            <div>Masuk</div>
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
