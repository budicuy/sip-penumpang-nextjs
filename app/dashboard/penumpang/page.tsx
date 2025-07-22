"use client";
import { IconEdit, IconTrash, IconEye, IconPlus, IconDownload, IconSearch, IconX } from "@tabler/icons-react";
import { useState, useEffect, FormEvent, useCallback, useMemo, memo, useRef } from "react";
import Papa from "papaparse";
import dynamic from "next/dynamic";
import PdfDocument from './PdfDocument';

const PDFDownloadLink = dynamic(
    () => import('@react-pdf/renderer').then(mod => mod.PDFDownloadLink),
    {
        ssr: false,
        loading: () => (
            <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center justify-center opacity-50 cursor-not-allowed">
                <IconDownload className="w-5 h-5 mr-2" />Preparing PDF...
            </button>
        )
    }
);

interface Penumpang {
    id: string;
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

const ITEMS_PER_PAGE = 200;
const SEARCH_DEBOUNCE_MS = 500;

const TUJUAN_OPTIONS = ["Pel Tarjun", "Pel Stagen"];
const GOLONGAN_OPTIONS = ["I", "II", "III", "IVa", "IVb", "V", "VI", "VII", "VIII", "IX"];
const KAPAL_OPTIONS = ["KMF Stagen", "KMF Tarjun", "KMF Benua Raya"];

const TableRow = memo(({
    item,
    index,
    currentPage,
    isSelected,
    onSelect,
    onEdit,
    onDelete,
    onView
}: {
    item: Penumpang;
    index: number;
    currentPage: number;
    isSelected: boolean;
    onSelect: (id: string) => void;
    onEdit: (item: Penumpang) => void;
    onDelete: (id: string) => void;
    onView: (item: Penumpang) => void;
}) => (
    <tr className={`hover:bg-gray-100 border-b border-gray-200 ${isSelected ? 'bg-blue-100' : ''}`}>
        <td className="px-6 py-4 whitespace-nowrap text-center">
            <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onSelect(item.id)}
                aria-label={`Select ${item.nama}`}
            />
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-center">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
        <td className="px-6 py-4 whitespace-nowrap">{item.nama}</td>
        <td className="px-6 py-4 whitespace-nowrap">{item.usia}</td>
        <td className="px-6 py-4 whitespace-nowrap text-center">{item.jenisKelamin}</td>
        <td className="px-6 py-4 whitespace-nowrap">{item.tujuan}</td>
        <td className="px-6 py-4 whitespace-nowrap">{new Date(item.tanggal).toLocaleDateString('id-ID')}</td>
        <td className="px-6 py-4 whitespace-nowrap">{item.nopol}</td>
        <td className="px-6 py-4 whitespace-nowrap">{item.jenisKendaraan}</td>
        <td className="px-6 py-4 whitespace-nowrap text-center">{item.golongan}</td>
        <td className="px-6 py-4 whitespace-nowrap">{item.kapal}</td>
        <td className="px-6 py-4 whitespace-nowrap flex items-center justify-center space-x-1">
            <button
                onClick={() => onEdit(item)}
                className="text-blue-600 hover:text-blue-800 p-2 bg-blue-100 rounded"
                aria-label={`Edit ${item.nama}`}
            >
                <IconEdit className="w-4 h-4" />
            </button>
            <button
                onClick={() => onDelete(item.id)}
                className="text-red-600 hover:text-red-800 p-2 bg-red-100 rounded"
                aria-label={`Delete ${item.nama}`}
            >
                <IconTrash className="w-4 h-4" />
            </button>
            <button
                onClick={() => onView(item)}
                className="text-green-600 hover:text-green-800 p-2 bg-green-100 rounded"
                aria-label={`View ${item.nama}`}
            >
                <IconEye className="w-4 h-4" />
            </button>
        </td>
    </tr>
));
TableRow.displayName = 'TableRow';

const PenumpangTable = memo(({
    paginatedData,
    isLoading,
    selectedRows,
    allChecked,
    currentPage,
    onSelectAll,
    onSelectRow,
    onEdit,
    onDelete,
    onView
}: {
    paginatedData: Penumpang[];
    isLoading: boolean;
    selectedRows: Set<string>;
    allChecked: boolean;
    currentPage: number;
    onSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSelectRow: (id: string) => void;
    onEdit: (item: Penumpang) => void;
    onDelete: (id: string) => void;
    onView: (item: Penumpang) => void;
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
                            aria-label="Select all rows"
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
                    <tr><td colSpan={12} className="text-center py-4">Loading...</td></tr>
                ) : paginatedData.length === 0 ? (
                    <tr><td colSpan={12} className="text-center py-4">Tidak ada data</td></tr>
                ) : (
                    paginatedData.map((item, index) => (
                        <TableRow
                            key={item.id}
                            item={item}
                            index={index}
                            currentPage={currentPage}
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

const PenumpangModal = memo(({
    isModalOpen,
    modalType,
    isSubmitting,
    selectedPenumpang,
    onClose,
    onSubmit
}: {
    isModalOpen: boolean;
    modalType: "add" | "edit" | "view";
    isSubmitting: boolean;
    selectedPenumpang: Penumpang | null;
    onClose: () => void;
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}) => {
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (isModalOpen && modalType !== "view") {
            formRef.current?.nama.focus();
        }
    }, [isModalOpen, modalType]);

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
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                        aria-label="Close modal"
                    >
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
                    <form ref={formRef} onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="mb-4">
                            <label htmlFor="nama" className="block text-gray-700 mb-1">Nama</label>
                            <input
                                type="text"
                                id="nama"
                                name="nama"
                                defaultValue={selectedPenumpang?.nama}
                                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                                required
                                maxLength={100}
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="usia" className="block text-gray-700 mb-1">Usia</label>
                            <input
                                type="number"
                                id="usia"
                                name="usia"
                                defaultValue={selectedPenumpang?.usia}
                                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                                required
                                min="1"
                                max="150"
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="jenisKelamin" className="block text-gray-700 mb-1">Jenis Kelamin</label>
                            <select
                                id="jenisKelamin"
                                name="jenisKelamin"
                                defaultValue={selectedPenumpang?.jenisKelamin || 'L'}
                                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="L">Laki-laki</option>
                                <option value="P">Perempuan</option>
                            </select>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="tujuan" className="block text-gray-700 mb-1">Tujuan</label>
                            <select
                                id="tujuan"
                                name="tujuan"
                                defaultValue={selectedPenumpang?.tujuan || TUJUAN_OPTIONS[0]}
                                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                {TUJUAN_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="tanggal" className="block text-gray-700 mb-1">Tanggal</label>
                            <input
                                type="date"
                                id="tanggal"
                                name="tanggal"
                                defaultValue={selectedPenumpang?.tanggal ? new Date(selectedPenumpang.tanggal).toISOString().split("T")[0] : ""}
                                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                                required
                                max={new Date().toISOString().split("T")[0]}
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="nopol" className="block text-gray-700 mb-1">No. Polisi</label>
                            <input
                                type="text"
                                id="nopol"
                                name="nopol"
                                defaultValue={selectedPenumpang?.nopol}
                                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                                required
                                pattern="[A-Z]{1,2}\s?\d{1,4}\s?[A-Z]{1,3}"
                                title="Format: DA 1234 AB"
                                maxLength={12}
                                style={{ textTransform: 'uppercase' }}
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="jenisKendaraan" className="block text-gray-700 mb-1">Jenis Kendaraan</label>
                            <input
                                type="text"
                                id="jenisKendaraan"
                                name="jenisKendaraan"
                                defaultValue={selectedPenumpang?.jenisKendaraan}
                                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                                required
                                maxLength={50}
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="golongan" className="block text-gray-700 mb-1">Golongan</label>
                            <select
                                id="golongan"
                                name="golongan"
                                defaultValue={selectedPenumpang?.golongan || GOLONGAN_OPTIONS[0]}
                                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                {GOLONGAN_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="kapal" className="block text-gray-700 mb-1">Kapal</label>
                            <select
                                id="kapal"
                                name="kapal"
                                defaultValue={selectedPenumpang?.kapal || KAPAL_OPTIONS[0]}
                                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                {KAPAL_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-2 flex justify-end space-x-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                                disabled={isSubmitting}
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                                disabled={isSubmitting}
                            >
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
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                        disabled={isProcessing}
                    >
                        Batal
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                        disabled={isProcessing}
                    >
                        {isProcessing ? 'Memproses...' : 'Hapus'}
                    </button>
                </div>
            </div>
        </div>
    );
});
ConfirmDialog.displayName = 'ConfirmDialog';

export default function Penumpang() {
    const [penumpang, setPenumpang] = useState<Penumpang[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPenumpang, setSelectedPenumpang] = useState<Penumpang | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<"add" | "edit" | "view">("add");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [filterStartDate, setFilterStartDate] = useState("");
    const [filterEndDate, setFilterEndDate] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, id: '', type: 'single' });
    const [isDeleting, setIsDeleting] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        fetchPenumpang();
        return () => {
            abortControllerRef.current?.abort();
        };
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setCurrentPage(1);
        }, SEARCH_DEBOUNCE_MS);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        setCurrentPage(1);
    }, [filterStartDate, filterEndDate]);

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

    const filteredPenumpang = useMemo(() => {
        let filtered = penumpang;
        if (debouncedSearchTerm) {
            const searchLower = debouncedSearchTerm.toLowerCase();
            filtered = filtered.filter(p =>
                p.nama.toLowerCase().includes(searchLower) ||
                p.tujuan.toLowerCase().includes(searchLower) ||
                p.nopol.toLowerCase().includes(searchLower) ||
                p.kapal.toLowerCase().includes(searchLower)
            );
        }
        if (filterStartDate) {
            filtered = filtered.filter(p => new Date(p.tanggal) >= new Date(filterStartDate));
        }
        if (filterEndDate) {
            const endDate = new Date(filterEndDate);
            endDate.setHours(23, 59, 59, 999);
            filtered = filtered.filter(p => new Date(p.tanggal) <= endDate);
        }
        return filtered;
    }, [penumpang, debouncedSearchTerm, filterStartDate, filterEndDate]);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredPenumpang.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredPenumpang, currentPage]);

    const pdfExportData = useMemo(() => {
        return selectedRows.size > 0 ? penumpang.filter(p => selectedRows.has(p.id)) : filteredPenumpang;
    }, [selectedRows, penumpang, filteredPenumpang]);

    const totalPages = Math.ceil(filteredPenumpang.length / ITEMS_PER_PAGE);
    const selectedCount = selectedRows.size;

    const fetchPenumpang = async () => {
        setIsLoading(true);
        setError(null);
        abortControllerRef.current?.abort();
        abortControllerRef.current = new AbortController();

        try {
            const response = await fetch("/api/penumpang", {
                signal: abortControllerRef.current.signal
            });
            if (!response.ok) throw new Error('Failed to fetch data');
            const data = await response.json();
            setPenumpang(data);
        } catch (error: any) {
            if (error.name !== 'AbortError') {
                setError("Gagal memuat data penumpang");
                console.error("Error fetching penumpang:", error);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleModalOpen = useCallback((type: "add" | "edit" | "view", penumpang?: Penumpang) => {
        setModalType(type);
        setSelectedPenumpang(penumpang || null);
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
            nopol: (rawData.nopol as string).toUpperCase().replace(/\s+/g, ' ')
        };

        try {
            const url = modalType === "add" ? "/api/penumpang" : `/api/penumpang/${selectedPenumpang?.id}`;
            const method = modalType === "add" ? "POST" : "PUT";

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error('Failed to save data');

            await fetchPenumpang();
            handleModalClose();
            setSuccessMessage(`Data berhasil ${modalType === "add" ? "ditambahkan" : "diperbarui"}`);
        } catch (error) {
            setError(`Gagal ${modalType === "add" ? "menambahkan" : "memperbarui"} data`);
            console.error("Error submitting form:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = useCallback((id: string) => {
        setConfirmDialog({ isOpen: true, id, type: 'single' });
    }, []);

    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        setError(null);

        try {
            if (confirmDialog.type === 'single') {
                const response = await fetch(`/api/penumpang/${confirmDialog.id}`, { method: "DELETE" });
                if (!response.ok) throw new Error('Failed to delete');
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
            setConfirmDialog({ isOpen: false, id: '', type: 'single' });
        } catch (error) {
            setError("Gagal menghapus data");
            console.error("Error deleting:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSelectAll = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedRows(new Set(paginatedData.map(p => p.id)));
        } else {
            setSelectedRows(new Set());
        }
    }, [paginatedData]);

    const handleSelectRow = useCallback((id: string) => {
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
        setConfirmDialog({ isOpen: true, id: '', type: 'multiple' });
    };

    const handleExportCSV = useCallback(() => {
        try {
            const dataToExport = selectedCount > 0 ? penumpang.filter(p => selectedRows.has(p.id)) : filteredPenumpang;
            const csvData = dataToExport.map((p, index) => ({
                No: index + 1,
                Nama: p.nama,
                Usia: p.usia,
                'Jenis Kelamin': p.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan',
                Tujuan: p.tujuan,
                Tanggal: new Date(p.tanggal).toLocaleDateString('id-ID'),
                'No. Polisi': p.nopol,
                'Jenis Kendaraan': p.jenisKendaraan,
                Golongan: p.golongan,
                Kapal: p.kapal
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
            setSuccessMessage("Data berhasil diexport ke CSV");
        } catch (error) {
            setError("Gagal export data ke CSV");
        }
    }, [selectedRows, selectedCount, penumpang, filteredPenumpang]);

    const handleResetFilters = useCallback(() => {
        setSearchTerm("");
        setFilterStartDate("");
        setFilterEndDate("");
        setCurrentPage(1);
    }, []);

    const allChecked = paginatedData.length > 0 && paginatedData.every(item => selectedRows.has(item.id));

    const handleEdit = useCallback((item: Penumpang) => handleModalOpen("edit", item), [handleModalOpen]);
    const handleView = useCallback((item: Penumpang) => handleModalOpen("view", item), [handleModalOpen]);

    return (
        <div>
            <h1 className="text-2xl lg:text-4xl font-bold text-black mb-5">Manifest Data Penumpang</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {successMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    {successMessage}
                </div>
            )}

            <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Manifest Data Penumpang ({filteredPenumpang.length} data)
                </h2>

                <div className="mb-4 grid gap-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                    <button
                        onClick={() => handleModalOpen("add")}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center hover:bg-blue-700"
                    >
                        <IconPlus className="w-5 h-5 mr-2" />Tambah Data
                    </button>

                    <button
                        onClick={handleExportCSV}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center justify-center hover:bg-green-700"
                    >
                        <IconDownload className="w-5 h-5 mr-2" />
                        {selectedCount > 0 ? `Export Selected (${selectedCount})` : 'Export to CSV'}
                    </button>

                    {PDFDownloadLink && (
                        <PDFDownloadLink
                            key={`${selectedRows.size}-${pdfExportData.length}`}
                            document={<PdfDocument data={pdfExportData} />}
                            fileName={`penumpang_${new Date().toISOString().split('T')[0]}.pdf`}
                            className="bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center justify-center hover:bg-yellow-700"
                        >
                            {({ loading }) =>
                                loading ? 'Preparing PDF...' :
                                    <><IconDownload className="w-5 h-5 mr-2" />
                                        {selectedCount > 0 ? `Export Selected (${selectedCount}) to PDF` : 'Export to PDF'}</>
                            }
                        </PDFDownloadLink>
                    )}

                    {selectedCount > 0 && (
                        <button
                            onClick={handleDeleteSelected}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center justify-center hover:bg-red-700"
                        >
                            <IconTrash className="w-5 h-5 mr-2" />Delete Selected ({selectedCount})
                        </button>
                    )}
                </div>

                <div className="mb-4 flex items-center space-x-2 border border-gray-300 rounded-lg px-3">
                    <IconSearch className="w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Cari nama, tujuan, nopol, atau kapal..."
                        className="w-full px-3 py-2 rounded focus:outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="filterStartDate" className="block text-gray-700 mb-1">Dari Tanggal</label>
                        <input
                            type="date"
                            id="filterStartDate"
                            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                            value={filterStartDate}
                            onChange={(e) => setFilterStartDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="filterEndDate" className="block text-gray-700 mb-1">Sampai Tanggal</label>
                        <input
                            type="date"
                            id="filterEndDate"
                            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                            value={filterEndDate}
                            onChange={(e) => setFilterEndDate(e.target.value)}
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={handleResetFilters}
                            className="w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                        >
                            Reset Filter
                        </button>
                    </div>
                </div>

                <div className="mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-sm text-gray-600">
                        Menampilkan {Math.min(ITEMS_PER_PAGE, paginatedData.length)} dari {filteredPenumpang.length} data
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                            className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100"
                            aria-label="First page"
                        >
                            «
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100"
                            aria-label="Previous page"
                        >
                            ‹
                        </button>
                        <input
                            type="number"
                            value={currentPage}
                            onChange={(e) => {
                                const page = parseInt(e.target.value) || 1;
                                setCurrentPage(Math.max(1, Math.min(page, totalPages)));
                            }}
                            className="w-16 px-2 py-1 border rounded text-center"
                            min="1"
                            max={totalPages}
                        />
                        <span className="px-2">/ {totalPages}</span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100"
                            aria-label="Next page"
                        >
                            ›
                        </button>
                        <button
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100"
                            aria-label="Last page"
                        >
                            »
                        </button>
                    </div>
                </div>

                <PenumpangTable
                    paginatedData={paginatedData}
                    isLoading={isLoading}
                    selectedRows={selectedRows}
                    allChecked={allChecked}
                    currentPage={currentPage}
                    onSelectAll={handleSelectAll}
                    onSelectRow={handleSelectRow}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleView}
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
                onCancel={() => setConfirmDialog({ isOpen: false, id: '', type: 'single' })}
                isProcessing={isDeleting}
            />
        </div>
    );
}