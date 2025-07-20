"use client";
import { IconEdit, IconTrash, IconEye, IconPlus } from "@tabler/icons-react";
import { useState, useEffect, FormEvent } from "react";

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
    const [selectedPenumpang, setSelectedPenumpang] = useState<Penumpang | null>(
        null
    );
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<"add" | "edit" | "view">(
        "add"
    );

    useEffect(() => {
        fetchPenumpang();
    }, []);

    const fetchPenumpang = async () => {
        try {
            const response = await fetch("/api/penumpang");
            const data = await response.json();
            setPenumpang(data);
        } catch (error) {
            console.error("Error fetching penumpang:", error);
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

    return (
        <div>
            <h1 className="text-2xl lg:text-4xl font-bold text-black mb-5">
                Manifest Data Penumpang
            </h1>
            <div className="bg-white p-6 rounded-lg shadow mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Data Penumpang
                    </h2>
                    <button
                        onClick={() => handleModalOpen("add")}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
                    >
                        <IconPlus className="w-5 h-5 mr-2" />
                        Tambah Data
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr className="bg-blue-600 text-white">
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
                            {penumpang.map((item, index) => (
                                <tr
                                    key={item.id}
                                    className="hover:bg-gray-100 border-b border-gray-200"
                                >
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
                                            className="text-red-600 hover:text-red-800 ml-2 p-2 bg-red-100 rounded"
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
                            ))}
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
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-blue-600 text-white px-4 py-2 rounded"
                                    >
                                        Simpan
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
