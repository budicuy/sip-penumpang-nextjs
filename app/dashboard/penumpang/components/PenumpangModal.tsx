"use client";
import { FormEvent, memo } from 'react';
import { IconX } from "@tabler/icons-react";
import { Penumpang } from "@/types/penumpang";
import { TUJUAN_OPTIONS, GOLONGAN_OPTIONS, KAPAL_OPTIONS } from '@/app/utils/constants';

interface PenumpangModalProps {
    isModalOpen: boolean;
    modalType: "add" | "edit" | "view";
    isSubmitting: boolean;
    selectedPenumpang: Penumpang | null;
    onClose: () => void;
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}

export const PenumpangModal = memo(({ isModalOpen, modalType, isSubmitting, selectedPenumpang, onClose, onSubmit }: PenumpangModalProps) => {
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
                                {TUJUAN_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}                            </select>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="tanggal" className="block text-gray-700 mb-1">Tanggal</label>
                            <input type="date" id="tanggal" name="tanggal" defaultValue={selectedPenumpang?.tanggal ? new Date(selectedPenumpang.tanggal).toISOString().split("T")[0] : ""} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500" required />
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
                                {GOLONGAN_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}                            </select>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="kapal" className="block text-gray-700 mb-1">Kapal</label>
                            <select id="kapal" name="kapal" defaultValue={selectedPenumpang?.kapal || KAPAL_OPTIONS[0]} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500" required>
                                {KAPAL_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}                            </select>
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