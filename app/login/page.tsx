'use client';

import { IconUser, IconLogin } from '@tabler/icons-react';
import Link from 'next/link';
import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';

function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const promise = signIn('credentials', {
            redirect: false,
            email,
            password,
        }).then((result) => {
            if (result?.error) {
                throw new Error('Kombinasi email dan password salah');
            } else if (result?.ok) {
                router.push(callbackUrl);
                return 'Login berhasil!';
            }
            throw new Error('Terjadi kesalahan saat mencoba masuk.');
        });

        toast.promise(promise, {
            loading: 'Mencoba masuk...',
            success: (message) => <b>{message}</b>,
            error: (err) => <b>{err.message}</b>,
        }).finally(() => setLoading(false));
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
                            <div>
                                <label htmlFor="email" className="block  font-medium text-gray-700 mb-1">Email</label>
                                <input id="email" name="email" type="email" required className="appearance-none rounded-lg relative block w-full px-3 py-3 border placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 border-gray-300" placeholder="Masukkan email Anda" value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>
                            <div>
                                <label htmlFor="password" className="block  font-medium text-gray-700 mb-1">Password</label>
                                <input id="password" name="password" type="password" required className="appearance-none rounded-lg relative block w-full px-3 py-3 border placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 border-gray-300" placeholder="Masukkan password Anda" value={password} onChange={(e) => setPassword(e.target.value)} />
                            </div>
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

function LoginPageSkeleton() {
    return (
        <div className='bg-gradient-to-br from-white to-blue-400'>
            <div className="container mx-auto h-screen flex items-center justify-center">
                <div className='w-full max-w-lg'>
                    <div className="flex justify-center mb-4 ">
                        <div className='p-6 bg-gray-300 rounded-full drop-shadow-2xl animate-pulse'>
                            <IconUser size={48} className="text-gray-400" />
                        </div>
                    </div>
                    <div>
                        <div className="h-8 bg-gray-300 rounded w-3/4 mx-auto mt-6 animate-pulse"></div>
                        <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto mt-3 animate-pulse"></div>
                    </div>
                    <div className='mt-5 w-full px-5'>
                        <div className="rounded-md p-10 bg-white drop-shadow-xl space-y-4">
                            <div className="h-6 bg-gray-300 rounded w-1/4 animate-pulse"></div>
                            <div className="h-12 bg-gray-300 rounded w-full animate-pulse"></div>
                            <div className="h-6 bg-gray-300 rounded w-1/4 animate-pulse mt-4"></div>
                            <div className="h-12 bg-gray-300 rounded w-full animate-pulse"></div>
                            <div className="flex items-center mt-4">
                                <div className="h-4 w-4 bg-gray-300 rounded animate-pulse"></div>
                                <div className="h-4 bg-gray-300 rounded w-1/4 ml-2 animate-pulse"></div>
                            </div>
                            <div className="h-12 bg-gray-400 rounded w-full mt-4 animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<LoginPageSkeleton />}>
            <LoginForm />
        </Suspense>
    );
}