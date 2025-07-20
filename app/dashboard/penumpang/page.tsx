import { IconEdit, IconTrash, IconEye } from "@tabler/icons-react"

export default function Penumpang() {
    return (
        <div>
            <h1 className="text-2xl lg:text-4xl font-bold text-black mb-5">
                Manifest Data Penumpang
            </h1>
            <div className="bg-white p-6 rounded-lg shadow mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Data Penumpang</h2>
                </div>

                <div className="overflow-x-auto">

                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr className="bg-blue-600 text-white">
                                <th className="px-6 py-3 text-left text-xs font-bold  uppercase tracking-wider text-nowrap">No</th>
                                <th className="px-6 py-3 text-left text-xs font-bold  uppercase tracking-wider text-nowrap">Nama</th>
                                <th className="px-6 py-3 text-left text-xs font-bold  uppercase tracking-wider text-nowrap">Usia</th>
                                <th className="px-6 py-3 text-left text-xs font-bold  uppercase tracking-wider text-nowrap">Jenis Kelamin</th>
                                <th className="px-6 py-3 text-left text-xs font-bold  uppercase tracking-wider text-nowrap">Tujuan</th>
                                <th className="px-6 py-3 text-left text-xs font-bold  uppercase tracking-wider text-nowrap">Tanggal</th>
                                <th className="px-6 py-3 text-left text-xs font-bold  uppercase tracking-wider text-nowrap">Jam</th>
                                <th className="px-6 py-3 text-left text-xs font-bold  uppercase tracking-wider text-nowrap">No. Polisi</th>
                                <th className="px-6 py-3 text-left text-xs font-bold  uppercase tracking-wider text-nowrap">Jenis Kendaraan</th>
                                <th className="px-6 py-3 text-left text-xs font-bold  uppercase tracking-wider text-nowrap">Golongan</th>
                                <th className="px-6 py-3 text-left text-xs font-bold  uppercase tracking-wider text-nowrap">Kapal</th>
                                <th className="px-6 py-3 text-left text-xs font-bold  uppercase tracking-wider text-nowrap">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Example row, replace with dynamic data */}
                            <tr className="hover:bg-gray-100 border-b border-gray-200">
                                <td className="px-6 py-4 whitespace-nowrap">1</td>
                                <td className="px-6 py-4 whitespace-nowrap">John Doe</td>
                                <td className="px-6 py-4 whitespace-nowrap">30</td>
                                <td className="px-6 py-4 whitespace-nowrap">Laki-laki</td>
                                <td className="px-6 py-4 whitespace-nowrap">Jakarta</td>
                                <td className="px-6 py-4 whitespace-nowrap">2023-10-01</td>
                                <td className="px-6 py-4 whitespace-nowrap">10:00 AM</td>
                                <td className="px-6 py-4 whitespace-nowrap">B 1234 XYZ</td>
                                <td className="px-6 py-4 whitespace-nowrap">Bus</td>
                                <td className="px-6 py-4 whitespace-nowrap">A</td>
                                <td className="px-6 py-4 whitespace-nowrap">Kapal Laut 1</td>
                                <td className="px-6 py-4 whitespace-nowrap flex items-center space-x-1">
                                    <button className="text-blue-600 hover:text-blue-800 p-2 bg-blue-100 rounded">
                                        <IconEdit className="w-4 h-4 " />
                                    </button>
                                    <button className="text-red-600 hover:text-red-800 ml-2 p-2 bg-red-100 rounded">
                                        <IconTrash className="w-4 h-4" />
                                    </button>
                                    <button className="text-green-600 hover:text-green-800 p-2 bg-green-100 rounded">
                                        <IconEye className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-100 border-b border-gray-200">
                                <td className="px-6 py-4 whitespace-nowrap">1</td>
                                <td className="px-6 py-4 whitespace-nowrap">John Doe</td>
                                <td className="px-6 py-4 whitespace-nowrap">30</td>
                                <td className="px-6 py-4 whitespace-nowrap">Laki-laki</td>
                                <td className="px-6 py-4 whitespace-nowrap">Jakarta</td>
                                <td className="px-6 py-4 whitespace-nowrap">2023-10-01</td>
                                <td className="px-6 py-4 whitespace-nowrap">10:00 AM</td>
                                <td className="px-6 py-4 whitespace-nowrap">B 1234 XYZ</td>
                                <td className="px-6 py-4 whitespace-nowrap">Bus</td>
                                <td className="px-6 py-4 whitespace-nowrap">A</td>
                                <td className="px-6 py-4 whitespace-nowrap">Kapal Laut 1</td>
                                <td className="px-6 py-4 whitespace-nowrap flex items-center space-x-1">
                                    <button className="text-blue-600 hover:text-blue-800 p-2 bg-blue-100 rounded">
                                        <IconEdit className="w-4 h-4 " />
                                    </button>
                                    <button className="text-red-600 hover:text-red-800 ml-2 p-2 bg-red-100 rounded">
                                        <IconTrash className="w-4 h-4" />
                                    </button>
                                    <button className="text-green-600 hover:text-green-800 p-2 bg-green-100 rounded">
                                        <IconEye className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
