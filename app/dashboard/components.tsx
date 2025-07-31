import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/auth";
import { Role } from "@prisma/client";
import { cache } from "react";
import {
  IconListCheck,
  IconUsers,
  IconUserPlus,
  IconTrendingUp,
} from "@tabler/icons-react";

interface StatCardProps {
  title: string;
  value: string;
  completed: string;
  icon: React.ElementType;
  color: string;
  trend?: string;
}

const StatCard = ({ title, value, completed, icon: Icon, color, trend }: StatCardProps) => {
  const getColorClasses = (color: string) => {
    const colors = {
      blue: "from-blue-500 to-blue-600 shadow-blue-700",
      green: "from-green-500 to-green-600 shadow-green-700",
      purple: "from-purple-500 to-purple-600 shadow-purple-700",
      orange: "from-orange-500 to-orange-600 shadow-orange-700",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="group relative bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
      <div
        className={`absolute inset-0 bg-gradient-to-r ${getColorClasses(
          color,
        )} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
      ></div>
      <div className="relative p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-medium">{title}</h3>
          <div
            className={`p-3 rounded-lg bg-gradient-to-r ${getColorClasses(
              color,
            )} shadow-lg`}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-3xl font-bold text-white">{value}</p>
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

export const getDashboardStats = cache(async () => {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id: string; role: Role } | undefined;

  if (!user) {
    throw new Error("Otentikasi diperlukan untuk melihat statistik.");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const whereClause: { userId?: string } = {};
  if (user.role === "USER") {
    whereClause.userId = user.id;
  }

  const totalPenumpangPromise = prisma.penumpang.count({ where: whereClause });

  const todayPenumpangPromise = prisma.penumpang.count({
    where: {
      ...whereClause,
      createdAt: {
        gte: today,
        lt: tomorrow,
      },
    },
  });

  const latestPenumpangPromise = prisma.penumpang.findMany({
    where: whereClause,
    take: 5,
    orderBy: { createdAt: "desc" },
    select: { id: true, nama: true, tujuan: true, tanggal: true, kapal: true, jenisKendaraan: true },
  });

  const userCountPromise =
    user.role === "ADMIN" ? prisma.user.count() : Promise.resolve(undefined);

  const [totalPenumpang, penumpangHariIni, penumpangTerbaru, totalPengguna] = await Promise.all([
    totalPenumpangPromise,
    todayPenumpangPromise,
    latestPenumpangPromise,
    userCountPromise,
  ]);

  return { totalPenumpang, penumpangHariIni, totalPengguna, penumpangTerbaru, userRole: user.role };
});

export async function StatCards() {
  const { totalPenumpang, penumpangHariIni, totalPengguna, userRole } = await getDashboardStats();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title={userRole === 'USER' ? "Total Penumpang Saya" : "Total Penumpang"}
        value={totalPenumpang.toString()}
        completed="Data Keseluruhan"
        icon={IconUsers}
        color="blue"
        trend="Live"
      />
      {userRole === "ADMIN" && (
        <StatCard
          title="Total Pengguna"
          value={totalPengguna?.toString() ?? '0'}
          completed="Pengguna Aktif"
          icon={IconUserPlus}
          color="green"
          trend="+Live"
        />
      )}
      <StatCard
        title={userRole === 'USER' ? "Penumpang Saya Hari Ini" : "Penumpang Hari Ini"}
        value={penumpangHariIni.toString()}
        completed="Data Hari Ini"
        icon={IconListCheck}
        color="purple"
        trend="Live"
      />
    </div>
  );
}

export async function LatestPenumpangTable() {
  const { penumpangTerbaru } = await getDashboardStats();

  return (
    <div className="bg-gray-800 p-8 rounded-lg shadow">
      <h2 className="text-xl text-white font-bold mb-4">Data Penumpang Terbaru</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b-2 border-gray-200">
              {["Nama", "Tujuan", "Tanggal", "Kapal", "Jenis Kendaraan"].map(
                (header) => (
                  <th
                    key={header}
                    className="pb-4 text-white whitespace-nowrap"
                  >
                    {header}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {penumpangTerbaru.map((penumpang) => (
              <tr
                key={penumpang.id}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
              >
                <td className="py-4 font-medium text-white whitespace-nowrap">
                  {penumpang.nama}
                </td>
                <td className="py-4 text-gray-400 whitespace-nowrap">
                  {penumpang.tujuan}
                </td>
                <td className="py-4 text-gray-400 whitespace-nowrap">
                  {new Date(penumpang.tanggal).toLocaleDateString("id-ID", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </td>
                <td className="py-4 text-gray-400 whitespace-nowrap">
                  {penumpang.kapal}
                </td>
                <td className="py-4 whitespace-nowrap">
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                    {penumpang.jenisKendaraan}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {penumpangTerbaru.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Tidak ada data penumpang tersedia
          </div>
        )}
      </div>
    </div>
  );
}
