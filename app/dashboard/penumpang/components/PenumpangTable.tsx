"use client";
import { memo } from 'react';
import { Penumpang } from "@/types/penumpang";
import { IconEdit, IconEye, IconTrash } from '@tabler/icons-react';

const TableRow = memo(({ item, index, currentPage, itemsPerPage, isSelected, onSelect, onEdit, onDelete, onView }: {
    item: Penumpang;
    index: number;
    currentPage: number;
    itemsPerPage: number;
    isSelected: boolean;
    onSelect: (id: string) => void;
    onEdit: (item: Penumpang) => void;
    onDelete: (id: string) => void;
    onView: (item: Penumpang) => void;
}) => (
    <tr
        className={`border-b border-gray-200 cursor-pointer transition-colors text-black ${isSelected
            ? 'bg-blue-100  hover:bg-blue-200'
            : 'hover:bg-gray-700 text-white'
            }`}
        onClick={() => onSelect(item.id)}
    >
        <td className="px-6 py-4 whitespace-nowrap text-center" onClick={(e) => e.stopPropagation()}>
            <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onSelect(item.id)}
                className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-center">{(currentPage - 1) * itemsPerPage + index + 1}</td>
        <td className="px-6 py-4 whitespace-nowrap">{item.nama}</td>
        <td className="px-6 py-4 whitespace-nowrap">{item.usia}</td>
        <td className="px-6 py-4 whitespace-nowrap text-center">{item.jenisKelamin}</td>
        <td className="px-6 py-4 whitespace-nowrap">{item.tujuan}</td>
        <td className="px-6 py-4 whitespace-nowrap">{new Date(item.tanggal).toLocaleDateString('id-ID')}</td>
        <td className="px-6 py-4 whitespace-nowrap">{item.nopol}</td>
        <td className="px-6 py-4 whitespace-nowrap">{item.jenisKendaraan}</td>
        <td className="px-6 py-4 whitespace-nowrap text-center">{item.golongan}</td>
        <td className="px-6 py-4 whitespace-nowrap">{item.kapal}</td>
        <td className="px-6 py-4 whitespace-nowrap flex items-center justify-center space-x-1" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => onEdit(item)} className="text-blue-600 hover:text-blue-800 p-2 bg-blue-100 rounded transition-colors">
                <IconEdit className="w-4 h-4" />
            </button>
            <button onClick={() => onDelete(item.id)} className="text-red-600 hover:text-red-800 p-2 bg-red-100 rounded transition-colors">
                <IconTrash className="w-4 h-4" />
            </button>
            <button onClick={() => onView(item)} className="text-green-600 hover:text-green-800 p-2 bg-green-100 rounded transition-colors">
                <IconEye className="w-4 h-4" />
            </button>
        </td>
    </tr>
));
TableRow.displayName = 'TableRow';

export const PenumpangTable = memo(({
    paginatedData,
    isLoading,
    selectedRows,
    allChecked,
    currentPage,
    itemsPerPage,
    onSelectAll,
    onSelectRow,
    onEdit,
    onDelete,
    onView,
    searchTerm,
    filterStartDate,
    filterEndDate,
    onResetFilters
}: {
    paginatedData: Penumpang[];
    isLoading: boolean;
    selectedRows: Set<string>;
    allChecked: boolean;
    currentPage: number;
    itemsPerPage: number;
    onSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSelectRow: (id: string) => void;
    onEdit: (item: Penumpang) => void;
    onDelete: (id: string) => void;
    onView: (item: Penumpang) => void;
    searchTerm: string;
    filterStartDate: string;
    filterEndDate: string;
    onResetFilters: () => void;
}) => (
    <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
            <thead>
                <tr className="bg-blue-900 text-white text-center">
                    <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider">
                        <input
                            type="checkbox"
                            onChange={onSelectAll}
                            checked={allChecked}
                            className="w-5 h-5 text-blue-600 bg-gray-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                    </th>
                    <th className="px-6 py-3 text-xs font-bold uppercase tracking-wide text-nowrap ">No</th>
                    <th className="px-6 py-3 text-xs font-bold uppercase tracking-wide text-nowrap ">Nama</th>
                    <th className="px-6 py-3 text-xs font-bold uppercase tracking-wide text-nowrap ">Usia</th>
                    <th className="px-6 py-3 text-xs font-bold uppercase tracking-wide text-nowrap ">Jenis Kelamin</th>
                    <th className="px-6 py-3 text-xs font-bold uppercase tracking-wide text-nowrap ">Tujuan</th>
                    <th className="px-6 py-3 text-xs font-bold uppercase tracking-wide text-nowrap ">Tanggal</th>
                    <th className="px-6 py-3 text-xs font-bold uppercase tracking-wide text-nowrap ">No. Polisi</th>
                    <th className="px-6 py-3 text-xs font-bold uppercase tracking-wide text-nowrap ">Jenis Kendaraan</th>
                    <th className="px-6 py-3 text-xs font-bold uppercase tracking-wide text-nowrap ">Golongan</th>
                    <th className="px-6 py-3 text-xs font-bold uppercase tracking-wide text-nowrap ">Kapal</th>
                    <th className="px-6 py-3 text-xs font-bold uppercase tracking-wide text-nowrap ">Aksi</th>
                </tr>
            </thead>
            <tbody>
                {isLoading ? (
                    <tr>
                        <td colSpan={12} className="text-center py-8">
                            <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                                Loading...
                            </div>
                        </td>
                    </tr>
                ) : paginatedData.length === 0 ? (
                    <tr>
                        <td colSpan={12} className="text-center py-8">
                            <div className="text-white">
                                {searchTerm || filterStartDate || filterEndDate ? (
                                    <div>
                                        <p className="mb-2">Tidak ada data yang sesuai dengan pencarian</p>
                                        <button
                                            onClick={onResetFilters}
                                            className="hover:text-blue-800 underline text-sm"
                                        >
                                            Reset filter pencarian
                                        </button>
                                    </div>
                                ) : (
                                    "Tidak ada data penumpang"
                                )}
                            </div>
                        </td>
                    </tr>
                ) : (
                    paginatedData.map((item, index) => (
                        <TableRow
                            key={item.id}
                            item={item}
                            index={index}
                            currentPage={currentPage}
                            itemsPerPage={itemsPerPage}
                            isSelected={selectedRows.has(item.id)}
                            onSelect={onSelectRow}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onView={onView}
                        />
                    ))
                )}
            </tbody>
        </table>
    </div>
));
PenumpangTable.displayName = 'PenumpangTable';
