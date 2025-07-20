import IconDownload from '@tabler/icons-react/dist/esm/icons/IconDownload'
import React from 'react'

export default function Penumpang() {
    return (
        <div>
            <h1 className="text-2xl lg:text-4xl font-bold text-black mb-5">
                Manifest Data Penumpang
            </h1>
            <div className="bg-white p-6 rounded-lg shadow mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Data Penumpang</h2>
                    <button className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                        <IconDownload className="w-5 h-5" />
                        <span>Export CSV</span>
                    </button>
                </div>

                <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nomor Telepon</th>
                        </tr>
                    </thead>
                </table>
            </div>
        </div>
    )
}
