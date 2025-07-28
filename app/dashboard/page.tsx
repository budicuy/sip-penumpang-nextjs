'use client';
import { useState, useEffect } from 'react';
import {
    IconListCheck,
    IconUsers,
    IconUserPlus,
    IconTrendingUp
} from "@tabler/icons-react";
import { useSession } from 'next-auth/react'; // 1. Ganti useAuth dengan useSession

interface StatCardProps {
    title: string;
    value: string;
    completed: string;
    icon: React.ElementType;
    color: string;
    trend?: string;
}

interface Penumpang {
    id: number;
    nama: string;
    tujuan: string;
    tanggal: string;
    kapal: string;
    jenisKendaraan: string;
}

interface DashboardStats {
    totalPenumpang: number;
    penumpangHariIni: number;
    totalPengguna?: number;
    penumpangTerbaru: Penumpang[];
}

const StatCard = ({ title, value, completed, icon: Icon, color, trend }: StatCardProps) => {
    const getColorClasses = (color: string) => {
        const colors = {
            blue: 'from-blue-500 to-blue-600 shadow-blue-200',
            green: 'from-green-500 to-green-600 shadow-green-200',
            purple: 'from-purple-500 to-purple-600 shadow-purple-200',
            orange: 'from-orange-500 to-orange-600 shadow-orange-200'
        };
        return colors[color as keyof typeof colors] || colors.blue;
    };

    return (
        <div className="group relative bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-r ${getColorClasses(color)} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
            <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-600 font-medium">{title}</h3>
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${getColorClasses(color)} shadow-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                </div>
                <div className="space-y-2">
                    <p className="text-3xl font-bold text-gray-800">{value}</p>
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500">{completed}</p>
                        {trend && (
                            <span className="flex items-center text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                <IconTrendingUp className="w-3 h-3 mr-1" />
                                {trend}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function Dashboard() {
    // 2. Gunakan useSession untuk mendapatkan data sesi dan status otentikasi
    const { data: session, status } = useSession();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setLoadingData(true);
        setError(null);
        try {
            const response = await fetch('/api/dashboard');
            if (!response.ok) {
                throw new Error('Gagal mengambil data dasbor');
            }
            const data: DashboardStats = await response.json();
            setStats(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
        } finally {
            setLoadingData(false);
        }
    };

    useEffect(() => {
        // 3. Ambil data hanya jika status sesi adalah "authenticated"
        if (status === 'authenticated') {
            fetchData();
        } else if (status === 'unauthenticated') {
            // Jika tidak terotentikasi, hentikan loading dan bisa tampilkan pesan
            setLoadingData(false);
            setError("Anda tidak memiliki akses. Silakan login.");
        }
        // `status` menjadi dependency untuk menjalankan effect ini saat status otentikasi berubah
    }, [status]);

    // 4. Tampilkan loading selama status otentikasi atau pengambilan data sedang berjalan
    if (status === 'loading' || loadingData) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="relative">
                    <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-spin"></div>
                    <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center h-full space-y-4">
                <div className="text-red-500 text-xl font-semibold">⚠️ {error}</div>
                <button
                    onClick={fetchData}
                    className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                    Coba Lagi
                </button>
            </div>
        );
    }

    return (
        <>
            <div className="flex justify-between items-center mb-5">
                <h1 className="text-2xl lg:text-4xl font-bold text-black">Dashboard</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Penumpang"
                    value={stats?.totalPenumpang?.toString() || '0'}
                    completed="Data Keseluruhan"
                    icon={IconUsers}
                    color="blue"
                    trend="Live"
                />
                {/* 5. Tampilkan kartu Total Pengguna hanya jika role user adalah ADMIN */}
                {session?.user?.role === 'ADMIN' && (
                    <StatCard
                        title="Total Pengguna"
                        value={stats?.totalPengguna?.toString() || '0'}
                        completed="Pengguna Aktif"
                        icon={IconUserPlus}
                        color="green"
                        trend="+Live"
                    />
                )}
                <StatCard
                    title="Penumpang Hari Ini"
                    value={stats?.penumpangHariIni?.toString() || '0'}
                    completed="Data Hari Ini"
                    icon={IconListCheck}
                    color="purple"
                    trend="Live"
                />
            </div>

            <div className="bg-white p-8 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4">Data Penumpang Terbaru</h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left border-b-2 border-gray-200">
                                {['Nama', 'Tujuan', 'Tanggal', 'Kapal', 'Jenis Kendaraan'].map((header) => (
                                    <th key={header} className="pb-4 text-gray-600 whitespace-nowrap">
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {stats?.penumpangTerbaru?.map((penumpang) => (
                                <tr
                                    key={penumpang.id}
                                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
                                >
                                    <td className="py-4 font-medium text-gray-800 whitespace-nowrap">{penumpang.nama}</td>
                                    <td className="py-4 text-gray-600 whitespace-nowrap">{penumpang.tujuan}</td>
                                    <td className="py-4 text-gray-600 whitespace-nowrap">
                                        {new Date(penumpang.tanggal).toLocaleDateString('id-ID', {
                                            year: 'numeric', month: 'long', day: 'numeric'
                                        })}
                                    </td>
                                    <td className="py-4 text-gray-600 whitespace-nowrap">{penumpang.kapal}</td>
                                    <td className="py-4 whitespace-nowrap">
                                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                                            {penumpang.jenisKendaraan}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {stats?.penumpangTerbaru?.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            Tidak ada data penumpang tersedia
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
