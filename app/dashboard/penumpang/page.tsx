"use client";
import { IconEdit, IconTrash, IconEye, IconPlus, IconDownload, IconSearch } from "@tabler/icons-react";
import { useState, useEffect, FormEvent, useCallback, useMemo, memo } from "react";
import Papa from "papaparse";
import { PDFDownloadLink } from '@react-pdf/renderer';
import PdfDocument from './PdfDocument';

interface Penumpang {
    id: string;
    nama: string;
    usia: number;
    jenisKelamin: string;
    tujuan: string;
    tanggal: string;
    jam: string;
    nopol: string;
    jenisKendaraan: string;
    golongan: string;
    kapal: string;
}

const TableRow = memo(({
    item,
    index,
    currentPage,
    itemsPerPage,
    isSelected,
    onSelect,
    onEdit,
    onDelete,
    onView
}: {
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
    <tr className={`hover:bg-gray-100 border-b border-gray-200 ${isSelected ? 'bg-blue-100' : ''}`}>
        <td className="px-6 py-4 whitespace-nowrap">
            <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onSelect(item.id)}
            />
        </td>
        <td className="px-6 py-4 whitespace-nowrap">{(currentPage - 1) * itemsPerPage + index + 1}</td>
        <td className="px-6 py-4 whitespace-nowrap">{item.nama}</td>
        <td className="px-6 py-4 whitespace-nowrap">{item.usia}</td>
        <td className="px-6 py-4 whitespace-nowrap">{item.jenisKelamin}</td>
        <td className="px-6 py-4 whitespace-nowrap">{item.tujuan}</td>
        <td className="px-6 py-4 whitespace-nowrap">{new Date(item.tanggal).toLocaleDateString()}</td>
        <td className="px-6 py-4 whitespace-nowrap">{new Date(item.jam).toLocaleTimeString()}</td>
        <td className="px-6 py-4 whitespace-nowrap">{item.nopol}</td>
        <td className="px-6 py-4 whitespace-nowrap">{item.jenisKendaraan}</td>
        <td className="px-6 py-4 whitespace-nowrap">{item.golongan}</td>
        <td className="px-6 py-4 whitespace-nowrap">{item.kapal}</td>
        <td className="px-6 py-4 whitespace-nowrap flex items-center space-x-1">
            <button onClick={() => onEdit(item)} className="text-blue-600 hover:text-blue-800 p-2 bg-blue-100 rounded"><IconEdit className="w-4 h-4" /></button>
            <button onClick={() => onDelete(item.id)} className="text-red-600 hover:text-red-800 p-2 bg-red-100 rounded"><IconTrash className="w-4 h-4" /></button>
            <button onClick={() => onView(item)} className="text-green-600 hover:text-green-800 p-2 bg-green-100 rounded"><IconEye className="w-4 h-4" /></button>
        </td>
    </tr>
));
TableRow.displayName = 'TableRow';


const PenumpangTable = memo(({ paginatedData, isLoading, selectedRows, allChecked, currentPage, itemsPerPage, onSelectAll, onSelectRow, onEdit, onDelete, onView }: { paginatedData: Penumpang[]; isLoading: boolean; selectedRows: Set<string>; allChecked: boolean; currentPage: number; itemsPerPage: number; onSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void; onSelectRow: (id: string) => void; onEdit: (item: Penumpang) => void; onDelete: (id: string) => void; onView: (item: Penumpang) => void; }) => (
    <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
            <thead>
                <tr className="bg-blue-600 text-white">
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider"><input type="checkbox" onChange={onSelectAll} checked={allChecked} /></th>
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">No</th>
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Nama</th>
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Usia</th>
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Jenis Kelamin</th>
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Tujuan</th>
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Tanggal</th>
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Jam</th>
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">No. Polisi</th>
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Jenis Kendaraan</th>
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Golongan</th>
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Kapal</th>
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Aksi</th>
                </tr>
            </thead>
            <tbody>
                {isLoading ? (
                    <tr><td colSpan={13} className="text-center py-4">Loading...</td></tr>
                ) : (
                    paginatedData.map((item, index) => (
                        <TableRow key={item.id} item={item} index={index} currentPage={currentPage} itemsPerPage={itemsPerPage} isSelected={selectedRows.has(item.id)} onSelect={onSelectRow} onEdit={onEdit} onDelete={onDelete} onView={onView} />
                    ))
                )}
            </tbody>
        </table>
    </div>
));
PenumpangTable.displayName = 'PenumpangTable';

const PenumpangModal = memo(({ isModalOpen, modalType, isSubmitting, selectedPenumpang, onClose, onSubmit }: { isModalOpen: boolean; modalType: "add" | "edit" | "view"; isSubmitting: boolean; selectedPenumpang: Penumpang | null; onClose: () => void; onSubmit: (e: FormEvent<HTMLFormElement>) => void; }) => {
    if (!isModalOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 h-full w-full flex items-start justify-center py-10 px-4">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl overflow-y-auto max-h-full">
                <h2 className="text-2xl font-semibold mb-4">
                    {modalType === "add" && "Tambah Penumpang"}
                    {modalType === "edit" && "Edit Penumpang"}
                    {modalType === "view" && "Detail Penumpang"}
                </h2>
                {modalType === "view" ? (
                    <div>
                        <p><strong>Nama:</strong> {selectedPenumpang?.nama}</p>
                        <p><strong>Usia:</strong> {selectedPenumpang?.usia}</p>
                        <p><strong>Jenis Kelamin:</strong> {selectedPenumpang?.jenisKelamin}</p>
                        <p><strong>Tujuan:</strong> {selectedPenumpang?.tujuan}</p>
                        <p><strong>Tanggal:</strong> {selectedPenumpang?.tanggal ? new Date(selectedPenumpang.tanggal).toLocaleDateString() : ""}</p>
                        <p><strong>Jam:</strong> {selectedPenumpang?.jam ? new Date(selectedPenumpang.jam).toLocaleTimeString() : ""}</p>
                        <p><strong>No. Polisi:</strong> {selectedPenumpang?.nopol}</p>
                        <p><strong>Jenis Kendaraan:</strong> {selectedPenumpang?.jenisKendaraan}</p>
                        <p><strong>Golongan:</strong> {selectedPenumpang?.golongan}</p>
                        <p><strong>Kapal:</strong> {selectedPenumpang?.kapal}</p>
                        <button onClick={onClose} className="mt-4 bg-gray-500 text-white px-4 py-2 rounded">Close</button>
                    </div>
                ) : (
                    <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="mb-4"><label className="block text-gray-700">Nama</label><input type="text" name="nama" defaultValue={selectedPenumpang?.nama} className="w-full px-3 py-2 border rounded" required /></div>
                        <div className="mb-4"><label className="block text-gray-700">Usia</label><input type="number" name="usia" defaultValue={selectedPenumpang?.usia} className="w-full px-3 py-2 border rounded" required /></div>
                        <div className="mb-4"><label className="block text-gray-700">Jenis Kelamin</label><select name="jenisKelamin" defaultValue={selectedPenumpang?.jenisKelamin} className="w-full px-3 py-2 border rounded" required><option value="LakiLaki">Laki-laki</option><option value="Perempuan">Perempuan</option></select></div>
                        <div className="mb-4"><label className="block text-gray-700">Tujuan</label><select name="tujuan" defaultValue={selectedPenumpang?.tujuan} className="w-full px-3 py-2 border rounded" required><option value="Pel Tarjun">Pel Tarjun</option><option value="Pel Stagen">Pel Stagen</option></select></div>
                        <div className="mb-4"><label className="block text-gray-700">Tanggal</label><input type="date" name="tanggal" defaultValue={selectedPenumpang?.tanggal ? new Date(selectedPenumpang.tanggal).toISOString().split("T")[0] : ""} className="w-full px-3 py-2 border rounded" required /></div>
                        <div className="mb-4"><label className="block text-gray-700">Jam</label><input type="time" name="jam" defaultValue={selectedPenumpang?.jam ? new Date(selectedPenumpang.jam).toTimeString().split(" ")[0] : ""} className="w-full px-3 py-2 border rounded" required /></div>
                        <div className="mb-4"><label className="block text-gray-700">No. Polisi</label><input type="text" name="nopol" defaultValue={selectedPenumpang?.nopol} className="w-full px-3 py-2 border rounded" required /></div>
                        <div className="mb-4"><label className="block text-gray-700">Jenis Kendaraan</label><input type="text" name="jenisKendaraan" defaultValue={selectedPenumpang?.jenisKendaraan} className="w-full px-3 py-2 border rounded" required /></div>
                        <div className="mb-4"><label className="block text-gray-700">Golongan</label><select name="golongan" defaultValue={selectedPenumpang?.golongan} className="w-full px-3 py-2 border rounded" required><option value="I">I</option><option value="II">II</option><option value="III">III</option><option value="IVa">IVa</option><option value="IVb">IVb</option><option value="V">V</option><option value="VI">VI</option><option value="VII">VII</option><option value="VIII">VIII</option><option value="IX">IX</option></select></div>
                        <div className="mb-4"><label className="block text-gray-700">Kapal</label><select name="kapal" defaultValue={selectedPenumpang?.kapal} className="w-full px-3 py-2 border rounded" required><option value="KMF Stagen">KMF Stagen</option><option value="KMF Tarjun">KMF Tarjun</option><option value="KMF Benua Raya">KMF Benua Raya</option></select></div>
                        <div className="md:col-span-2 flex justify-end"><button type="button" onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded mr-2" disabled={isSubmitting}>Batal</button><button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={isSubmitting}>{isSubmitting ? "Menyimpan..." : "Simpan"}</button></div>
                    </form>
                )}
            </div>
        </div>
    );
}
);

PenumpangModal.displayName = 'PenumpangModal';


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
    const [filterStartTime, setFilterStartTime] = useState("");
    const [filterEndTime, setFilterEndTime] = useState("");
    const [isPdfReady, setIsPdfReady] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 200;

    useEffect(() => {
        fetchPenumpang();
        setIsPdfReady(true);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setCurrentPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        setCurrentPage(1);
    }, [filterStartDate, filterEndDate, filterStartTime, filterEndTime]);

    const filteredPenumpang = useMemo(() => {
        let filtered = penumpang;
        if (debouncedSearchTerm) {
            const searchLower = debouncedSearchTerm.toLowerCase();
            filtered = filtered.filter(p => p.nama.toLowerCase().includes(searchLower) || p.tujuan.toLowerCase().includes(searchLower) || p.nopol.toLowerCase().includes(searchLower));
        }
        if (filterStartDate) filtered = filtered.filter(p => new Date(p.tanggal) >= new Date(filterStartDate));
        if (filterEndDate) filtered = filtered.filter(p => new Date(p.tanggal) <= new Date(filterEndDate));
        if (filterStartTime) filtered = filtered.filter(p => new Date(p.jam).toTimeString().split(' ')[0] >= filterStartTime);
        if (filterEndTime) filtered = filtered.filter(p => new Date(p.jam).toTimeString().split(' ')[0] <= filterEndTime);
        return filtered;
    }, [penumpang, debouncedSearchTerm, filterStartDate, filterEndDate, filterStartTime, filterEndTime]);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredPenumpang.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredPenumpang, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredPenumpang.length / itemsPerPage);
    const selectedCount = selectedRows.size;

    const fetchPenumpang = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/penumpang");
            const data = await response.json();
            setPenumpang(data);
        } catch (error) {
            console.error("Error fetching penumpang:", error);
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
        const formData = new FormData(e.currentTarget);
        const rawData = Object.fromEntries(formData.entries());
        const data = { ...rawData, usia: Number(rawData.usia), tanggal: new Date(rawData.tanggal as string).toISOString(), jam: new Date(`${rawData.tanggal as string}T${rawData.jam as string}`).toISOString() };

        try {
            if (modalType === "add") {
                await fetch("/api/penumpang", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
            } else if (modalType === "edit" && selectedPenumpang) {
                await fetch(`/api/penumpang/${selectedPenumpang.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
            }
            fetchPenumpang();
            handleModalClose();
        } catch (error) {
            console.error("Error submitting form:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = useCallback(async (id: string) => {
        if (window.confirm("Are you sure you want to delete this item?")) {
            try {
                await fetch(`/api/penumpang/${id}`, { method: "DELETE" });
                fetchPenumpang();
            } catch (error) {
                console.error("Error deleting penumpang:", error);
            }
        }
    }, []);

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
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    }, []);

    const handleDeleteSelected = async () => {
        if (window.confirm(`Are you sure you want to delete ${selectedCount} selected items?`)) {
            try {
                await Promise.all(Array.from(selectedRows).map((id) => fetch(`/api/penumpang/${id}`, { method: "DELETE" })));
                fetchPenumpang();
                setSelectedRows(new Set());
            } catch (error) {
                console.error("Error deleting selected penumpang:", error);
            }
        }
    };

    const handleExportCSV = useCallback(() => {
        const dataToExport = selectedCount > 0 ? penumpang.filter(p => selectedRows.has(p.id)) : filteredPenumpang;
        const csv = Papa.unparse(dataToExport);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', selectedCount > 0 ? 'selected_penumpang.csv' : 'all_penumpang.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, [selectedRows, selectedCount, penumpang, filteredPenumpang]);

    const allChecked = paginatedData.length > 0 && paginatedData.every(item => selectedRows.has(item.id));

    const handleEdit = useCallback((item: Penumpang) => handleModalOpen("edit", item), [handleModalOpen]);
    const handleView = useCallback((item: Penumpang) => handleModalOpen("view", item), [handleModalOpen]);

    return (
        <div>
            <h1 className="text-2xl lg:text-4xl font-bold text-black mb-5">Manifest Data Penumpang</h1>
            <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Manifest Data Penumpang ({filteredPenumpang.length} data)</h2>
                <div className="mb-4 grid gap-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                    <button onClick={() => handleModalOpen("add")} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"><IconPlus className="w-5 h-5 mr-2" />Tambah Data</button>
                    <button onClick={handleExportCSV} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center"><IconDownload className="w-5 h-5 mr-2" />{selectedCount > 0 ? `Export Selected (${selectedCount})` : 'Export All to CSV'}</button>
                    {isPdfReady && (
                        <PDFDownloadLink document={<PdfDocument data={filteredPenumpang} />} fileName="penumpang.pdf" className="bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center">
                            {({ loading }) => loading ? 'Loading document...' : <><IconDownload className="w-5 h-5 mr-2" />Export to PDF</>}
                        </PDFDownloadLink>
                    )}
                    {selectedCount > 0 && <button onClick={handleDeleteSelected} className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center"><IconTrash className="w-5 h-5 mr-2" />Delete Selected ({selectedCount})</button>}
                </div>
                <div className="mb-4 flex items-center space-x-2 border border-gray-300 rounded-lg px-3">
                    <IconSearch className="w-5 h-5 inline-block mr-2" />
                    <input type="text" placeholder="Cari nama data penumpang..." className="w-full px-3 py-2 rounded focus:outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div><label className="block text-gray-700 mb-1">Dari Tanggal</label><input type="date" className="w-full px-3 py-2 border rounded" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} /></div>
                    <div><label className="block text-gray-700 mb-1">Sampai Tanggal</label><input type="date" className="w-full px-3 py-2 border rounded" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} /></div>
                    <div><label className="block text-gray-700 mb-1">Dari Jam</label><input type="time" className="w-full px-3 py-2 border rounded" value={filterStartTime} onChange={(e) => setFilterStartTime(e.target.value)} /></div>
                    <div><label className="block text-gray-700 mb-1">Sampai Jam</label><input type="time" className="w-full px-3 py-2 border rounded" value={filterEndTime} onChange={(e) => setFilterEndTime(e.target.value)} /></div>
                </div>
                <div className="mb-4 flex justify-between items-center">
                    <div className="text-sm text-gray-600">Menampilkan {Math.min(itemsPerPage, paginatedData.length)} dari {filteredPenumpang.length} data</div>
                    <div className="flex space-x-2">
                        <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
                        <span className="px-3 py-1">{currentPage} / {totalPages}</span>
                        <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
                    </div>
                </div>
                <PenumpangTable paginatedData={paginatedData} isLoading={isLoading} selectedRows={selectedRows} allChecked={allChecked} currentPage={currentPage} itemsPerPage={itemsPerPage} onSelectAll={handleSelectAll} onSelectRow={handleSelectRow} onEdit={handleEdit} onDelete={handleDelete} onView={handleView} />
            </div>
            <PenumpangModal isModalOpen={isModalOpen} modalType={modalType} isSubmitting={isSubmitting} selectedPenumpang={selectedPenumpang} onClose={handleModalClose} onSubmit={handleSubmit} />
        </div>
    );
}
