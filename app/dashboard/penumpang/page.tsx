"use client";
import { IconEdit, IconTrash, IconEye, IconPlus, IconDownload, IconSearch } from "@tabler/icons-react";
import { useState, useEffect, FormEvent } from "react";
import Papa from "papaparse";

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

export default function Penumpang() {
    const [penumpang, setPenumpang] = useState<Penumpang[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPenumpang, setSelectedPenumpang] = useState<Penumpang | null>(
        null
    );
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<"add" | "edit" | "view">(
        "add"
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [filteredPenumpang, setFilteredPenumpang] = useState<Penumpang[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStartDate, setFilterStartDate] = useState("");
    const [filterEndDate, setFilterEndDate] = useState("");
    const [filterStartTime, setFilterStartTime] = useState("");
    const [filterEndTime, setFilterEndTime] = useState("");

    useEffect(() => {
        fetchPenumpang();
    }, []);

    useEffect(() => {
        let filtered = penumpang;

        if (searchTerm) {
            filtered = filtered.filter(p =>
                p.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.tujuan.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.nopol.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filterStartDate) {
            filtered = filtered.filter(p => new Date(p.tanggal) >= new Date(filterStartDate));
        }

        if (filterEndDate) {
            filtered = filtered.filter(p => new Date(p.tanggal) <= new Date(filterEndDate));
        }

        if (filterStartTime) {
            filtered = filtered.filter(p => new Date(p.jam).toTimeString().split(' ')[0] >= filterStartTime);
        }

        if (filterEndTime) {
            filtered = filtered.filter(p => new Date(p.jam).toTimeString().split(' ')[0] <= filterEndTime);
        }

        setFilteredPenumpang(filtered.slice(0, 50));
    }, [penumpang, searchTerm, filterStartDate, filterEndDate, filterStartTime, filterEndTime]);

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

    const handleModalOpen = (
        type: "add" | "edit" | "view",
        penumpang?: Penumpang
    ) => {
        setModalType(type);
        setSelectedPenumpang(penumpang || null);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedPenumpang(null);
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);
        const rawData = Object.fromEntries(formData.entries());

        const tanggalValue = rawData.tanggal as string;
        const jamValue = rawData.jam as string;

        const data = {
            ...rawData,
            usia: Number(rawData.usia),
            tanggal: new Date(tanggalValue).toISOString(),
            jam: new Date(`${tanggalValue}T${jamValue}`).toISOString(),
        };

        try {
            if (modalType === "add") {
                await fetch("/api/penumpang", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                });
            } else if (modalType === "edit" && selectedPenumpang) {
                await fetch(`/api/penumpang/${selectedPenumpang.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                });
            }
            fetchPenumpang();
            handleModalClose();
        } catch (error) {
            console.error("Error submitting form:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this item?")) {
            try {
                await fetch(`/api/penumpang/${id}`, {
                    method: "DELETE",
                });
                fetchPenumpang();
            } catch (error) {
                console.error("Error deleting penumpang:", error);
            }
        }
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            const allIds = filteredPenumpang.map((p) => p.id);
            setSelectedRows(allIds);
        } else {
            setSelectedRows([]);
        }
    };

    const handleSelectRow = (id: string) => {
        setSelectedRows((prev) =>
            prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
        );
    };

    const handleDeleteSelected = async () => {
        if (window.confirm(`Are you sure you want to delete ${selectedRows.length} selected items?`)) {
            try {
                await Promise.all(
                    selectedRows.map((id) =>
                        fetch(`/api/penumpang/${id}`, {
                            method: "DELETE",
                        })
                    )
                );
                fetchPenumpang();
                setSelectedRows([]);
            } catch (error) {
                console.error("Error deleting selected penumpang:", error);
            }
        }
    };

    const handleExportAllCSV = () => {
        const csv = Papa.unparse(filteredPenumpang);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'all_penumpang.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportSelectedCSV = () => {
        const dataToExport = penumpang.filter(p => selectedRows.includes(p.id));
        const csv = Papa.unparse(dataToExport);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'selected_penumpang.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div>
            <h1 className="text-2xl lg:text-4xl font-bold text-black mb-5">
                Manifest Data Penumpang
            </h1>
            <div className="bg-white p-6 rounded-lg shadow mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Manifest Data Penumpang
                    </h2>

                </div>
                <div className="mb-4 grid gap-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                    {/* tambah data */}
                    <button
                        onClick={() => handleModalOpen("add")}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
                    >
                        <IconPlus className="w-5 h-5 mr-2" />
                        Tambah Data
                    </button>
                    {/* Expot CSV */}
                    <button
                        onClick={handleExportAllCSV}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center"
                    >
                        <IconDownload className="w-5 h-5 mr-2" />
                        Export All to CSV
                    </button>
                    <button
                        onClick={() => alert("Export to PDF feature coming soon!")}
                        className="bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center"
                    >
                        <IconDownload className="w-5 h-5 mr-2" />
                        Export to PDF
                    </button>
                    {selectedRows.length > 0 && (
                        <>
                            <button
                                onClick={handleExportSelectedCSV}
                                className="bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
                            >
                                <IconDownload className="w-5 h-5 mr-2" />
                                Export Selected to CSV ({selectedRows.length})
                            </button>
                            <button
                                onClick={handleDeleteSelected}
                                className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center"
                            >
                                <IconTrash className="w-5 h-5 mr-2" />
                                Delete Selected ({selectedRows.length})
                            </button>
                        </>
                    )}
                </div>
                {/* filter pencarian */}
                <div className="mb-4 flex items-center space-x-2 border border-gray-300 rounded-lg px-3">
                    <IconSearch className="w-5 h-5 inline-block mr-2" />
                    <input
                        type="text"
                        placeholder="Cari nama data penumpang..."
                        className="w-full px-3 py-2 rounded focus:outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Filter Tanggal dan jam */}
                <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-gray-700 mb-1">Dari Tanggal</label>
                        <input
                            type="date"
                            className="w-full px-3 py-2 border rounded"
                            value={filterStartDate}
                            onChange={(e) => setFilterStartDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-1">Sampai Tanggal</label>
                        <input
                            type="date"
                            className="w-full px-3 py-2 border rounded"
                            value={filterEndDate}
                            onChange={(e) => setFilterEndDate(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-1">Dari Jam</label>
                        <input
                            type="time"
                            className="w-full px-3 py-2 border rounded"
                            value={filterStartTime}
                            onChange={(e) => setFilterStartTime(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-1">Sampai Jam</label>
                        <input
                            type="time"
                            className="w-full px-3 py-2 border rounded"
                            value={filterEndTime}
                            onChange={(e) => setFilterEndTime(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr className="bg-blue-600 text-white">
                                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
                                    <input
                                        type="checkbox"
                                        onChange={handleSelectAll}
                                        checked={filteredPenumpang.length > 0 && selectedRows.length === filteredPenumpang.length}
                                    />
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
                                    No
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
                                    Nama
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
                                    Usia
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
                                    Jenis Kelamin
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
                                    Tujuan
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
                                    Tanggal
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
                                    Jam
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
                                    No. Polisi
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
                                    Jenis Kendaraan
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
                                    Golongan
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
                                    Kapal
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={12} className="text-center py-4">
                                        Loading...
                                    </td>
                                </tr>
                            ) : (
                                filteredPenumpang.map((item, index) => (
                                    <tr
                                        key={item.id}
                                        className={`hover:bg-gray-100 border-b border-gray-200 ${selectedRows.includes(item.id) ? 'bg-blue-100' : ''}`}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="checkbox"
                                                checked={selectedRows.includes(item.id)}
                                                onChange={() => handleSelectRow(item.id)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">{index + 1}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{item.nama}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{item.usia}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {item.jenisKelamin}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">{item.tujuan}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {new Date(item.tanggal).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {new Date(item.jam).toLocaleTimeString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">{item.nopol}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {item.jenisKendaraan}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {item.golongan}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">{item.kapal}</td>
                                        <td className="px-6 py-4 whitespace-nowrap flex items-center space-x-1">
                                            <button
                                                onClick={() => handleModalOpen("edit", item)}
                                                className="text-blue-600 hover:text-blue-800 p-2 bg-blue-100 rounded"
                                            >
                                                <IconEdit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="text-red-600 hover:text-red-800 p-2 bg-red-100 rounded"
                                            >
                                                <IconTrash className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleModalOpen("view", item)}
                                                className="text-green-600 hover:text-green-800 p-2 bg-green-100 rounded">
                                                <IconEye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 h-full w-full flex items-start justify-center py-10 px-4">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl overflow-y-auto max-h-full">
                        <h2 className="text-2xl font-semibold mb-4">
                            {modalType === "add" && "Tambah Penumpang"}
                            {modalType === "edit" && "Edit Penumpang"}
                            {modalType === "view" && "Detail Penumpang"}
                        </h2>
                        {modalType === "view" ? (
                            <div>
                                <p>
                                    <strong>Nama:</strong> {selectedPenumpang?.nama}
                                </p>
                                <p>
                                    <strong>Usia:</strong> {selectedPenumpang?.usia}
                                </p>
                                <p>
                                    <strong>Jenis Kelamin:</strong>{" "}
                                    {selectedPenumpang?.jenisKelamin}
                                </p>
                                <p>
                                    <strong>Tujuan:</strong> {selectedPenumpang?.tujuan}
                                </p>
                                <p>
                                    <strong>Tanggal:</strong>{" "}
                                    {selectedPenumpang?.tanggal
                                        ? new Date(
                                            selectedPenumpang.tanggal
                                        ).toLocaleDateString()
                                        : ""}
                                </p>
                                <p>
                                    <strong>Jam:</strong>{" "}
                                    {selectedPenumpang?.jam
                                        ? new Date(selectedPenumpang.jam).toLocaleTimeString()
                                        : ""}
                                </p>
                                <p>
                                    <strong>No. Polisi:</strong> {selectedPenumpang?.nopol}
                                </p>
                                <p>
                                    <strong>Jenis Kendaraan:</strong>{" "}
                                    {selectedPenumpang?.jenisKendaraan}
                                </p>
                                <p>
                                    <strong>Golongan:</strong> {selectedPenumpang?.golongan}
                                </p>
                                <p>
                                    <strong>Kapal:</strong> {selectedPenumpang?.kapal}
                                </p>
                                <button
                                    onClick={handleModalClose}
                                    className="mt-4 bg-gray-500 text-white px-4 py-2 rounded"
                                >
                                    Close
                                </button>
                            </div>
                        ) : (
                            <form
                                onSubmit={handleSubmit}
                                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                            >
                                <div className="mb-4">
                                    <label className="block text-gray-700">Nama</label>
                                    <input
                                        type="text"
                                        name="nama"
                                        defaultValue={selectedPenumpang?.nama}
                                        className="w-full px-3 py-2 border rounded"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700">Usia</label>
                                    <input
                                        type="number"
                                        name="usia"
                                        defaultValue={selectedPenumpang?.usia}
                                        className="w-full px-3 py-2 border rounded"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700">Jenis Kelamin</label>
                                    <select
                                        name="jenisKelamin"
                                        defaultValue={selectedPenumpang?.jenisKelamin}
                                        className="w-full px-3 py-2 border rounded"
                                        required
                                    >
                                        <option value="LakiLaki">Laki-laki</option>
                                        <option value="Perempuan">Perempuan</option>
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700">Tujuan</label>
                                    <select
                                        name="tujuan"
                                        defaultValue={selectedPenumpang?.tujuan}
                                        className="w-full px-3 py-2 border rounded"
                                        required
                                    >
                                        <option value="Pel Tarjun">Pel Tarjun</option>
                                        <option value="Pel Stagen">Pel Stagen</option>
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700">Tanggal</label>
                                    <input
                                        type="date"
                                        name="tanggal"
                                        defaultValue={
                                            selectedPenumpang?.tanggal
                                                ? new Date(selectedPenumpang.tanggal)
                                                    .toISOString()
                                                    .split("T")[0]
                                                : ""
                                        }
                                        className="w-full px-3 py-2 border rounded"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700">Jam</label>
                                    <input
                                        type="time"
                                        name="jam"
                                        defaultValue={
                                            selectedPenumpang?.jam
                                                ? new Date(selectedPenumpang.jam)
                                                    .toTimeString()
                                                    .split(" ")[0]
                                                : ""
                                        }
                                        className="w-full px-3 py-2 border rounded"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700">No. Polisi</label>
                                    <input
                                        type="text"
                                        name="nopol"
                                        defaultValue={selectedPenumpang?.nopol}
                                        className="w-full px-3 py-2 border rounded"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700">
                                        Jenis Kendaraan
                                    </label>
                                    <input
                                        type="text"
                                        name="jenisKendaraan"
                                        defaultValue={selectedPenumpang?.jenisKendaraan}
                                        className="w-full px-3 py-2 border rounded"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700">Golongan</label>
                                    <select
                                        name="golongan"
                                        defaultValue={selectedPenumpang?.golongan}
                                        className="w-full px-3 py-2 border rounded"
                                        required
                                    >
                                        <option value="I">I</option>
                                        <option value="II">II</option>
                                        <option value="III">III</option>
                                        <option value="IVa">IVa</option>
                                        <option value="IVb">IVb</option>
                                        <option value="V">V</option>
                                        <option value="VI">VI</option>
                                        <option value="VII">VII</option>
                                        <option value="VIII">VIII</option>
                                        <option value="IX">IX</option>
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700">Kapal</label>
                                    <select
                                        name="kapal"
                                        defaultValue={selectedPenumpang?.kapal}
                                        className="w-full px-3 py-2 border rounded"
                                        required
                                    >
                                        <option value="KMF Stagen">KMF Stagen</option>
                                        <option value="KMF Tarjun">KMF Tarjun</option>
                                        <option value="KMF Benua Raya">KMF Benua Raya</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={handleModalClose}
                                        className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
                                        disabled={isSubmitting}
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-blue-600 text-white px-4 py-2 rounded"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? "Menyimpan..." : "Simpan"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
