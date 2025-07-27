'use client';
import { useState, useEffect } from 'react';
import {
    IconListCheck,
    IconUsers,
    IconBolt,
    IconUserPlus
} from "@tabler/icons-react";

// Definisikan tipe untuk data statistik dan penumpang
interface StatCard {
    title: string;
    value: string;
    completed: string;
    icon: React.ElementType;
}

interface Penumpang {
    id: number;
    nama: string;
    tujuan: string;
    tanggal: string;
    kapal: string;
    jenisKendaraan: string;
}

export default function Dashboard() {
    const [stats, setStats] = useState<StatCard[]>([]);
    const [latestPenumpang, setLatestPenumpang] = useState<Penumpang[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Ambil data penumpang dan pengguna secara bersamaan
                const [penumpangRes, usersRes] = await Promise.all([
                    fetch('/api/penumpang?limit=5'), // Ambil 5 data terbaru
                    fetch('/api/users')
                ]);

                if (!penumpangRes.ok || !usersRes.ok) {
                    throw new Error('Gagal mengambil data');
                }

                const penumpangData = await penumpangRes.json();
                const usersData = await usersRes.json();

                // Proses data untuk kartu statistik
                const newStats: StatCard[] = [
                    { title: 'Total Penumpang', value: penumpangData.total.toString(), completed: 'Data Penumpang', icon: IconUsers },
                    { title: 'Total Pengguna', value: usersData.length.toString(), completed: 'Data Pengguna', icon: IconUserPlus },
                    { title: 'Tugas Aktif', value: '132', completed: '28 Selesai', icon: IconListCheck },
                    { title: 'Produktifitas', value: '76%', completed: 'Naik 5%', icon: IconBolt },
                ];
                setStats(newStats);

                // Set data penumpang terbaru
                setLatestPenumpang(penumpangData.data);

            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('Terjadi kesalahan tidak dikenal');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="text-red-500 text-xl">Error: {error}</div>
            </div>
        );
    }

    return (
        <>
            <div className="flex justify-between items-center mb-5">
                <h1 className="text-2xl lg:text-4xl font-bold text-black">Dashboard</h1>
            </div>

            {/* Kartu Statistik Dinamis */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <h3 className="text-gray-600">{stat.title}</h3>
                            <div className="bg-purple-200 p-2 rounded">
                                <stat.icon className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold mt-2">{stat.value}</p>
                        <p className="text-sm text-gray-500">{stat.completed}</p>
                    </div>
                ))}
            </div>

            {/* Tabel Penumpang Terbaru */}
            <div className="bg-white p-8 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4">Data Penumpang Terbaru</h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-gray-600">
                                <th className="pb-4 text-nowrap">Nama</th>
                                <th className="pb-4 text-nowrap">Tujuan</th>
                                <th className="pb-4 text-nowrap">Tanggal</th>
                                <th className="pb-4 text-nowrap">Kapal</th>
                                <th className="pb-4 text-nowrap">Jenis Kendaraan</th>
                            </tr>
                        </thead>
                        <tbody>
                            {latestPenumpang.map((penumpang) => (
                                <tr key={penumpang.id} className="border-t">
                                    <td className="py-4 text-nowrap">{penumpang.nama}</td>
                                    <td className="py-4 text-nowrap">{penumpang.tujuan}</td>
                                    <td className="py-4 text-nowrap">
                                        {new Date(penumpang.tanggal).toLocaleDateString('id-ID', {
                                            year: 'numeric', month: 'long', day: 'numeric'
                                        })}
                                    </td>
                                    <td className="py-4 text-nowrap">{penumpang.kapal}</td>
                                    <td className="py-4 text-nowrap">{penumpang.jenisKendaraan}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
