"use client";
import { IconEdit, IconTrash, IconEye, IconPlus, IconDownload, IconSearch, IconX } from "@tabler/icons-react";
import { useState, useEffect, FormEvent, useCallback, useMemo, memo, useRef } from "react";
import Papa from "papaparse";

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Fungsi untuk membuat PDF
const generatePDFWithJsPDF = (data: Penumpang[]) => {
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
    });

    const addHeader = () => {
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('MANIFEST DATA PENUMPANG', 148, 20, { align: 'center' });

        const now = new Date();
        const options: Intl.DateTimeFormatOptions = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        };
        const dateStr = `Tanggal: ${now.toLocaleDateString('id-ID', options)}`;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(dateStr, 280, 35, { align: 'right' });
    };

    addHeader();

    const tableData = data.map((item, index) => [
        index + 1,
        item.nama || '-',
        item.usia || '-',
        item.jenisKelamin === 'L' ? 'L' : 'P',
        item.tujuan || '-',
        item.tanggal ? new Date(item.tanggal).toLocaleDateString('id-ID') : '-',
        item.nopol || '-',
        item.jenisKendaraan || '-',
        item.golongan || '-',
        item.kapal || '-'
    ]);

    const totalColumnWidth = 15 + 45 + 15 + 12 + 30 + 25 + 28 + 45 + 15 + 45;
    const pageWidth = doc.internal.pageSize.getWidth();
    const leftMargin = (pageWidth - totalColumnWidth) / 2;

    autoTable(doc, {
        head: [['No', 'Nama', 'Usia', 'JK', 'Tujuan', 'Tanggal', 'Nopol', 'Jenis Kendaraan', 'Gol', 'Kapal']],
        body: tableData,
        startY: 40,
        showHead: 'everyPage',
        styles: {
            fontSize: 8,
            cellPadding: 2,
            overflow: 'linebreak',
            cellWidth: 'wrap',
            halign: 'center'
        },
        headStyles: {
            fillColor: "blue",
            textColor: "white",
            fontStyle: 'bold',
            halign: 'center',
            fontSize: 8
        },
        alternateRowStyles: {
            fillColor: [240, 248, 255],
        },
        columnStyles: {
            0: { cellWidth: 15, halign: 'center' },
            1: { cellWidth: 45, halign: 'center' },
            2: { cellWidth: 15, halign: 'center' },
            3: { cellWidth: 12, halign: 'center' },
            4: { cellWidth: 30, halign: 'center' },
            5: { cellWidth: 25, halign: 'center' },
            6: { cellWidth: 28, halign: 'center' },
            7: { cellWidth: 45, halign: 'center' },
            8: { cellWidth: 15, halign: 'center' },
            9: { cellWidth: 45, halign: 'center' }
        },
        margin: {
            top: 40,
            left: Math.max(10, leftMargin),
            right: Math.max(10, leftMargin),
            bottom: 30
        },
        theme: 'grid',
        didDrawPage: (data) => {
            if (data.pageNumber > 1) {
                addHeader();
            }
        }
    });

    const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
    const signatureHeight = 35;
    const pageHeight = doc.internal.pageSize.getHeight();
    const bottomMargin = 30;
    const availableSpace = pageHeight - finalY - bottomMargin;

    const addSignatures = (signatureY: number) => {
        doc.setFontSize(12);
        const pageWidthForSignature = doc.internal.pageSize.getWidth();
        const leftSignature = pageWidthForSignature * 0.25;
        const rightSignature = pageWidthForSignature * 0.75;

        doc.text('Petugas', leftSignature, signatureY, { align: 'center' });
        doc.text('Nahkoda', rightSignature, signatureY, { align: 'center' });
        doc.text('(...............................)', leftSignature, signatureY + 25, { align: 'center' });
        doc.text('(...............................)', rightSignature, signatureY + 25, { align: 'center' });
    };

    if (availableSpace < signatureHeight) {
        doc.addPage();
        addHeader();
        addSignatures(60);
    } else {
        addSignatures(finalY + 25);
    }

    const addFooter = () => {
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`${i}`, 280, 200, { align: 'center' });
        }
    };

    addFooter();
    doc.save(`penumpang_${new Date().toISOString().split('T')[0]}.pdf`);
};

// Interface Penumpang dengan id sebagai number
interface Penumpang {
    id: number; // DIUBAH: dari string ke number
    nama: string;
    usia: number;
    jenisKelamin: string;
    tujuan: string;
    tanggal: string;
    nopol: string;
    jenisKendaraan: string;
    golongan: string;
    kapal: string;
}

// Konstanta
const SEARCH_DEBOUNCE_MS = 500;
const TUJUAN_OPTIONS = ["Pel Tarjun", "Pel Stagen"];
const GOLONGAN_OPTIONS = ["I", "II", "III", "IVa", "IVb", "V", "VI", "VII", "VIII", "IX"];
const KAPAL_OPTIONS = ["KMF Stagen", "KMF Tarjun", "KMF Benua Raya"];
const ITEMS_PER_PAGE_OPTIONS = [50, 100, 200, 300, 500, 1000, 2000, 5000, 10000];

// Komponen Baris Tabel
const TableRow = memo(({ item, index, currentPage, itemsPerPage, isSelected, onSelect, onEdit, onDelete, onView }: {
    item: Penumpang;
    index: number;
    currentPage: number;
    itemsPerPage: number;
    isSelected: boolean;
    onSelect: (id: number) => void; // DIUBAH: dari string ke number
    onEdit: (item: Penumpang) => void;
    onDelete: (id: number) => void; // DIUBAH: dari string ke number
    onView: (item: Penumpang) => void;
}) => (
    <tr
        className={`border-b border-gray-200 cursor-pointer transition-colors ${isSelected
            ? 'bg-blue-100 hover:bg-blue-200'
            : 'hover:bg-gray-50'
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

// Komponen Tabel Penumpang
const PenumpangTable = memo(({
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
    selectedRows: Set<number>; // DIUBAH: dari Set<string> ke Set<number>
    allChecked: boolean;
    currentPage: number;
    itemsPerPage: number;
    onSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSelectRow: (id: number) => void; // DIUBAH: dari string ke number
    onEdit: (item: Penumpang) => void;
    onDelete: (id: number) => void; // DIUBAH: dari string ke number
    onView: (item: Penumpang) => void;
    searchTerm: string;
    filterStartDate: string;
    filterEndDate: string;
    onResetFilters: () => void;
}) => (
    <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
            <thead>
                <tr className="bg-blue-600 text-white text-center">
                    <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider">
                        <input
                            type="checkbox"
                            onChange={onSelectAll}
                            checked={allChecked}
                            className="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                    </th>
                    <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider">No</th>
                    <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider">Nama</th>
                    <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider">Usia</th>
                    <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider">Jenis Kelamin</th>
                    <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider">Tujuan</th>
                    <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider">Tanggal</th>
                    <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider">No. Polisi</th>
                    <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider">Jenis Kendaraan</th>
                    <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider">Golongan</th>
                    <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider">Kapal</th>
                    <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider">Aksi</th>
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
                            <div className="text-gray-500">
                                {searchTerm || filterStartDate || filterEndDate ? (
                                    <div>
                                        <p className="mb-2">Tidak ada data yang sesuai dengan pencarian</p>
                                        <button
                                            onClick={onResetFilters}
                                            className="text-blue-600 hover:text-blue-800 underline text-sm"
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

// Komponen Modal
const PenumpangModal = memo(({ isModalOpen, modalType, isSubmitting, selectedPenumpang, onClose, onSubmit }: {
    isModalOpen: boolean;
    modalType: "add" | "edit" | "view";
    isSubmitting: boolean;
    selectedPenumpang: Penumpang | null;
    onClose: () => void;
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}) => {
    if (!isModalOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 h-full w-full flex items-start justify-center py-10 px-4 z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl overflow-y-auto max-h-full">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold">
                        {modalType === "add" && "Tambah Penumpang"}
                        {modalType === "edit" && "Edit Penumpang"}
                        {modalType === "view" && "Detail Penumpang"}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <IconX className="w-6 h-6" />
                    </button>
                </div>
                {modalType === "view" ? (
                    <div className="space-y-2">
                        <p><strong>Nama:</strong> {selectedPenumpang?.nama}</p>
                        <p><strong>Usia:</strong> {selectedPenumpang?.usia}</p>
                        <p><strong>Jenis Kelamin:</strong> {selectedPenumpang?.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
                        <p><strong>Tujuan:</strong> {selectedPenumpang?.tujuan}</p>
                        <p><strong>Tanggal:</strong> {selectedPenumpang?.tanggal ? new Date(selectedPenumpang.tanggal).toLocaleDateString('id-ID') : ""}</p>
                        <p><strong>No. Polisi:</strong> {selectedPenumpang?.nopol}</p>
                        <p><strong>Jenis Kendaraan:</strong> {selectedPenumpang?.jenisKendaraan}</p>
                        <p><strong>Golongan:</strong> {selectedPenumpang?.golongan}</p>
                        <p><strong>Kapal:</strong> {selectedPenumpang?.kapal}</p>
                        <button onClick={onClose} className="mt-4 bg-gray-500 text-white px-4 py-2 rounded">Tutup</button>
                    </div>
                ) : (
                    <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="mb-4">
                            <label htmlFor="nama" className="block text-gray-700 mb-1">Nama</label>
                            <input type="text" id="nama" name="nama" defaultValue={selectedPenumpang?.nama} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500" required maxLength={100} />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="usia" className="block text-gray-700 mb-1">Usia</label>
                            <input type="number" id="usia" name="usia" defaultValue={selectedPenumpang?.usia} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500" required min="1" max="150" />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="jenisKelamin" className="block text-gray-700 mb-1">Jenis Kelamin</label>
                            <select id="jenisKelamin" name="jenisKelamin" defaultValue={selectedPenumpang?.jenisKelamin || 'L'} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500" required>
                                <option value="L">Laki-laki</option>
                                <option value="P">Perempuan</option>
                            </select>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="tujuan" className="block text-gray-700 mb-1">Tujuan</label>
                            <select id="tujuan" name="tujuan" defaultValue={selectedPenumpang?.tujuan || TUJUAN_OPTIONS[0]} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500" required>
                                {TUJUAN_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="tanggal" className="block text-gray-700 mb-1">Tanggal</label>
                            <input type="date" id="tanggal" name="tanggal" defaultValue={selectedPenumpang?.tanggal ? new Date(selectedPenumpang.tanggal).toISOString().split("T")[0] : ""} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500" required max={new Date().toISOString().split("T")[0]} />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="nopol" className="block text-gray-700 mb-1">No. Polisi</label>
                            <input type="text" id="nopol" name="nopol" defaultValue={selectedPenumpang?.nopol} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500" required maxLength={12} style={{ textTransform: 'uppercase' }} />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="jenisKendaraan" className="block text-gray-700 mb-1">Jenis Kendaraan</label>
                            <input type="text" id="jenisKendaraan" name="jenisKendaraan" defaultValue={selectedPenumpang?.jenisKendaraan} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500" required maxLength={50} />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="golongan" className="block text-gray-700 mb-1">Golongan</label>
                            <select id="golongan" name="golongan" defaultValue={selectedPenumpang?.golongan || GOLONGAN_OPTIONS[0]} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500" required>
                                {GOLONGAN_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="kapal" className="block text-gray-700 mb-1">Kapal</label>
                            <select id="kapal" name="kapal" defaultValue={selectedPenumpang?.kapal || KAPAL_OPTIONS[0]} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500" required>
                                {KAPAL_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-2 flex justify-end space-x-2">
                            <button type="button" onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600" disabled={isSubmitting}>Batal</button>
                            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50" disabled={isSubmitting}>
                                {isSubmitting ? "Menyimpan..." : "Simpan"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
});
PenumpangModal.displayName = 'PenumpangModal';

// Komponen Dialog Konfirmasi
const ConfirmDialog = memo(({ isOpen, title, message, onConfirm, onCancel, isProcessing }: {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    isProcessing: boolean;
}) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md">
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="text-gray-600 mb-4">{message}</p>
                <div className="flex justify-end space-x-2">
                    <button onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400" disabled={isProcessing}>Batal</button>
                    <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50" disabled={isProcessing}>
                        {isProcessing ? 'Memproses...' : 'Hapus'}
                    </button>
                </div>
            </div>
        </div>
    );
});
ConfirmDialog.displayName = 'ConfirmDialog';

// Komponen Utama
export default function Penumpang() {
    const [penumpang, setPenumpang] = useState<Penumpang[]>([]);
    const [totalData, setTotalData] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPenumpang, setSelectedPenumpang] = useState<Penumpang | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<"add" | "edit" | "view">("add");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set()); // DIUBAH: dari Set<string> ke Set<number>
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [filterStartDate, setFilterStartDate] = useState("");
    const [filterEndDate, setFilterEndDate] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE_OPTIONS[0]);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; id: number | null; type: 'single' | 'multiple' }>({ isOpen: false, id: null, type: 'single' }); // DIUBAH: tipe state
    const [isDeleting, setIsDeleting] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    const fetchPenumpang = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        abortControllerRef.current?.abort();
        abortControllerRef.current = new AbortController();

        const params = new URLSearchParams({
            page: String(currentPage),
            limit: String(itemsPerPage),
            search: debouncedSearchTerm,
            startDate: filterStartDate,
            endDate: filterEndDate,
        });

        try {
            const timeoutId = setTimeout(() => {
                abortControllerRef.current?.abort();
            }, 10000);

            const response = await fetch(`/api/penumpang?${params.toString()}`, {
                signal: abortControllerRef.current.signal,
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                let errorMessage = 'Gagal memuat data';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`;
                } catch {
                    errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                }
                throw new Error(errorMessage);
            }

            const result = await response.json();

            if (result && typeof result === 'object' && 'data' in result && 'total' in result) {
                const { data = [], total = 0 } = result;
                if (Array.isArray(data)) {
                    setPenumpang(data);
                    setTotalData(typeof total === 'number' ? total : 0);
                } else {
                    throw new Error('Format data tidak valid dari server.');
                }
            } else {
                throw new Error('Format response tidak valid dari server.');
            }

        } catch (err: unknown) {
            if (err instanceof Error && err.name !== 'AbortError') {
                console.error("Fetch error details:", err);
                setError(err.message);
                setPenumpang([]);
                setTotalData(0);
            }
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, itemsPerPage, debouncedSearchTerm, filterStartDate, filterEndDate]);

    useEffect(() => {
        fetchPenumpang();
        return () => {
            abortControllerRef.current?.abort();
        };
    }, [fetchPenumpang]);

    useEffect(() => {
        const timer = setTimeout(() => {
            const sanitizedSearchTerm = searchTerm.trim().replace(/[<>]/g, '');
            setDebouncedSearchTerm(sanitizedSearchTerm);
            setCurrentPage(1);
        }, SEARCH_DEBOUNCE_MS);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        setCurrentPage(1);
    }, [filterStartDate, filterEndDate, itemsPerPage]);

    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const pdfExportData = useMemo(() => {
        return selectedRows.size > 0 ? penumpang.filter(p => selectedRows.has(p.id)) : penumpang;
    }, [selectedRows, penumpang]);

    const totalPages = Math.ceil(totalData / itemsPerPage);
    const selectedCount = selectedRows.size;

    const handleModalOpen = useCallback((type: "add" | "edit" | "view", penumpangItem?: Penumpang) => {
        setModalType(type);
        setSelectedPenumpang(penumpangItem || null);
        setIsModalOpen(true);
    }, []);

    const handleModalClose = useCallback(() => {
        setIsModalOpen(false);
        setSelectedPenumpang(null);
    }, []);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const rawData = Object.fromEntries(formData.entries());

        const data = {
            ...rawData,
            usia: Number(rawData.usia),
            tanggal: new Date(rawData.tanggal as string).toISOString(),
            nopol: (rawData.nopol as string).toUpperCase().replace(/\s+/g, ' ').trim(),
            nama: (rawData.nama as string).trim(),
            jenisKendaraan: (rawData.jenisKendaraan as string).trim(),
            kapal: (rawData.kapal as string).trim(),
            tujuan: (rawData.tujuan as string).trim(),
        };

        try {
            const url = modalType === "add" ? "/api/penumpang" : `/api/penumpang/${selectedPenumpang?.id}`;
            const method = modalType === "add" ? "POST" : "PUT";

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json", "Accept": "application/json" },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                let errorMessage = `Gagal ${modalType === "add" ? "menambahkan" : "memperbarui"} data`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } catch {
                    // fallback
                }
                throw new Error(errorMessage);
            }

            await response.json();
            await fetchPenumpang();
            handleModalClose();
            setSuccessMessage(`Data berhasil ${modalType === "add" ? "ditambahkan" : "diperbarui"}`);

        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError(`Gagal ${modalType === "add" ? "menambahkan" : "memperbarui"} data`);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = useCallback((id: number) => { // DIUBAH: dari string ke number
        setConfirmDialog({ isOpen: true, id, type: 'single' });
    }, []);

    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        setError(null);

        try {
            if (confirmDialog.type === 'single' && confirmDialog.id !== null) {
                const response = await fetch(`/api/penumpang/${confirmDialog.id}`, { method: "DELETE" });
                if (!response.ok) throw new Error('Gagal menghapus data tunggal');
                setSuccessMessage("Data berhasil dihapus");
            } else {
                const ids = Array.from(selectedRows);
                const batchSize = 10;

                for (let i = 0; i < ids.length; i += batchSize) {
                    const batch = ids.slice(i, i + batchSize);
                    await Promise.all(
                        batch.map(id => fetch(`/api/penumpang/${id}`, { method: "DELETE" }))
                    );
                }

                setSelectedRows(new Set());
                setSuccessMessage(`${ids.length} data berhasil dihapus`);
            }

            await fetchPenumpang();
            setConfirmDialog({ isOpen: false, id: null, type: 'single' }); // DIUBAH: id ke null
        } catch (err) {
            setError("Gagal menghapus data. Coba lagi.");
            console.error(err);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSelectAll = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedRows(new Set(penumpang.map(p => p.id)));
        } else {
            setSelectedRows(new Set());
        }
    }, [penumpang]);

    const handleSelectRow = useCallback((id: number) => { // DIUBAH: dari string ke number
        setSelectedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    }, []);

    const handleDeleteSelected = () => {
        setConfirmDialog({ isOpen: true, id: null, type: 'multiple' }); // DIUBAH: id ke null
    };

    const handleExportCSV = useCallback(async () => {
        try {
            let dataToExport: Penumpang[] = [];
            if (selectedCount > 0) {
                dataToExport = penumpang.filter(p => selectedRows.has(p.id));
            } else {
                const response = await fetch(`/api/penumpang?limit=${Math.max(1000, totalData)}`);
                if (!response.ok) throw new Error('Gagal mengambil semua data untuk export');
                const result = await response.json();
                dataToExport = result.data || [];
            }

            if (dataToExport.length === 0) {
                setError('Tidak ada data untuk di-export');
                return;
            }

            const csvData = dataToExport.map((p, index) => ({
                No: index + 1,
                Nama: p.nama || '-',
                Usia: p.usia || '-',
                'Jenis Kelamin': p.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan',
                Tujuan: p.tujuan || '-',
                Tanggal: p.tanggal ? new Date(p.tanggal).toLocaleDateString('id-ID') : '-',
                'No. Polisi': p.nopol || '-',
                'Jenis Kendaraan': p.jenisKendaraan || '-',
                Golongan: p.golongan || '-',
                Kapal: p.kapal || '-'
            }));

            const csv = Papa.unparse(csvData);
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `penumpang_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            setSuccessMessage(`${dataToExport.length} data berhasil di-export ke CSV`);

        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(`Export gagal: ${err.message}`);
            } else {
                setError("Gagal export data ke CSV");
            }
        }
    }, [selectedRows, selectedCount, penumpang, totalData]);

    const handleResetFilters = useCallback(() => {
        setSearchTerm("");
        setDebouncedSearchTerm("");
        setFilterStartDate("");
        setFilterEndDate("");
        setCurrentPage(1);
        setError(null);
    }, []);

    const allChecked = penumpang.length > 0 && penumpang.every(item => selectedRows.has(item.id));
    const handleEdit = useCallback((item: Penumpang) => handleModalOpen("edit", item), [handleModalOpen]);
    const handleView = useCallback((item: Penumpang) => handleModalOpen("view", item), [handleModalOpen]);

    return (
        <div>
            <h1 className="text-2xl lg:text-4xl font-bold text-black mb-5">Manifest Data Penumpang</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center justify-between">
                    <span>{error}</span>
                    <button onClick={fetchPenumpang} className="ml-4 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700">
                        Coba Lagi
                    </button>
                </div>
            )}

            {successMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{successMessage}</div>
            )}

            <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Manifest Data Penumpang ({totalData} data)
                </h2>

                <div className="mb-4 grid gap-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                    <button onClick={() => handleModalOpen("add")} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center hover:bg-blue-700">
                        <IconPlus className="w-5 h-5 mr-2" />Tambah Data
                    </button>

                    <button onClick={handleExportCSV} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center justify-center hover:bg-green-700">
                        <IconDownload className="w-5 h-5 mr-2" />
                        {selectedCount > 0 ? `Export Selected (${selectedCount})` : 'Export to CSV'}
                    </button>

                    <button
                        onClick={() => generatePDFWithJsPDF(pdfExportData)}
                        className="bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center justify-center hover:bg-yellow-700"
                    >
                        <IconDownload className="w-5 h-5 mr-2" />
                        {selectedCount > 0
                            ? `Export Selected (${selectedCount}) to PDF`
                            : 'Export to PDF'
                        }
                    </button>

                    {selectedCount > 0 && (
                        <button onClick={handleDeleteSelected} className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center justify-center hover:bg-red-700">
                            <IconTrash className="w-5 h-5 mr-2" />Delete Selected ({selectedCount})
                        </button>
                    )}
                </div>

                <div className="mb-4 flex items-center space-x-2 border border-gray-300 rounded-lg px-3 relative">
                    <IconSearch className="w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Cari nama, tujuan, nopol, atau kapal..."
                        className="w-full px-3 py-2 rounded focus:outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        maxLength={100}
                    />
                    {isLoading && searchTerm && (
                        <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        </div>
                    )}
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            title="Hapus pencarian"
                        >
                            <IconX className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label htmlFor="filterStartDate" className="block text-gray-700 mb-1">Dari Tanggal</label>
                        <input type="date" id="filterStartDate" className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} />
                    </div>
                    <div>
                        <label htmlFor="filterEndDate" className="block text-gray-700 mb-1">Sampai Tanggal</label>
                        <input type="date" id="filterEndDate" className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} />
                    </div>
                    <div>
                        <label htmlFor="itemsPerPage" className="block text-gray-700 mb-1">Data per Halaman</label>
                        <select id="itemsPerPage" value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500">
                            {ITEMS_PER_PAGE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button onClick={handleResetFilters} className="w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Reset Filter</button>
                    </div>
                </div>

                <div className="mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-sm text-gray-600">
                        <div>
                            Menampilkan {penumpang.length} dari {totalData} data
                            {selectedCount > 0 && <span className="ml-2 text-blue-600 font-medium">• {selectedCount} dipilih</span>}
                        </div>
                        {(debouncedSearchTerm || filterStartDate || filterEndDate) && (
                            <div className="text-xs text-gray-500 mt-1">
                                {debouncedSearchTerm && `Pencarian: "${debouncedSearchTerm}"`}
                                {filterStartDate && ` | Dari: ${filterStartDate}`}
                                {filterEndDate && ` | Sampai: ${filterEndDate}`}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center space-x-2">
                        <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100">«</button>
                        <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100">‹</button>
                        <input type="number" value={currentPage} onChange={(e) => {
                            const page = parseInt(e.target.value) || 1;
                            setCurrentPage(Math.max(1, Math.min(page, totalPages)));
                        }} className="w-16 px-2 py-1 border rounded text-center focus:ring-2 focus:ring-blue-500" min="1" max={totalPages} />
                        <span className="px-2">/ {totalPages}</span>
                        <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100">›</button>
                        <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100">»</button>
                    </div>
                </div>

                <PenumpangTable
                    paginatedData={penumpang}
                    isLoading={isLoading}
                    selectedRows={selectedRows}
                    allChecked={allChecked}
                    currentPage={currentPage}
                    itemsPerPage={itemsPerPage}
                    onSelectAll={handleSelectAll}
                    onSelectRow={handleSelectRow}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleView}
                    searchTerm={debouncedSearchTerm}
                    filterStartDate={filterStartDate}
                    filterEndDate={filterEndDate}
                    onResetFilters={handleResetFilters}
                />
            </div>

            <PenumpangModal
                isModalOpen={isModalOpen}
                modalType={modalType}
                isSubmitting={isSubmitting}
                selectedPenumpang={selectedPenumpang}
                onClose={handleModalClose}
                onSubmit={handleSubmit}
            />

            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                title="Konfirmasi Hapus"
                message={confirmDialog.type === 'single'
                    ? "Apakah Anda yakin ingin menghapus data ini?"
                    : `Apakah Anda yakin ingin menghapus ${selectedCount} data yang dipilih?`}
                onConfirm={handleDeleteConfirm}
                onCancel={() => setConfirmDialog({ isOpen: false, id: null, type: 'single' })} // DIUBAH: id ke null
                isProcessing={isDeleting}
            />
        </div>
    );
}
