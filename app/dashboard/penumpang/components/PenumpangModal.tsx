"use client";
import { memo, Ref } from "react";
import { useFormStatus } from "react-dom";
import { IconX } from "@tabler/icons-react";
import { Penumpang } from "@/types/penumpang";
import {
  TUJUAN_OPTIONS,
  GOLONGAN_OPTIONS,
  KAPAL_OPTIONS,
} from "@/app/utils/constants";
import { FormState } from "../actions";

interface PenumpangModalProps {
  isModalOpen: boolean;
  modalType: "add" | "edit" | "view";
  selectedPenumpang: Penumpang | null;
  onClose: () => void;
  formAction: (payload: FormData) => void;
  formState: FormState;
  formRef: Ref<HTMLFormElement>;
}

const SubmitButton = () => {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      disabled={pending}
    >
      {pending ? "Menyimpan..." : "Simpan"}
    </button>
  );
};

const FormField = ({ label, id, error, children }: { label: string, id: string, error?: string[], children: React.ReactNode }) => (
  <div className="mb-4">
    <label htmlFor={id} className="block text-white mb-1">{label}</label>
    {children}
    {error && <p className="text-red-500 text-sm mt-1">{error[0]}</p>}
  </div>
);

export const PenumpangModal = memo(
  ({
    isModalOpen,
    modalType,
    selectedPenumpang,
    onClose,
    formAction,
    formState,
    formRef,
  }: PenumpangModalProps) => {
    if (!isModalOpen) return null;

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 h-full w-full flex items-start justify-center py-10 px-4 z-50">
        <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-2xl overflow-y-auto max-h-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-white">
              {modalType === "add" && "Tambah Penumpang"}
              {modalType === "edit" && "Edit Penumpang"}
              {modalType === "view" && "Detail Penumpang"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <IconX className="w-6 h-6" />
            </button>
          </div>
          {modalType === "view" ? (
            <div className="space-y-2 text-white">
              <p>
                <strong>Nama:</strong> {selectedPenumpang?.nama}
              </p>
              <p>
                <strong>Usia:</strong> {selectedPenumpang?.usia}
              </p>
              <p>
                <strong>Jenis Kelamin:</strong>{" "}
                {selectedPenumpang?.jenisKelamin === "L"
                  ? "Laki-laki"
                  : "Perempuan"}
              </p>
              <p>
                <strong>Tujuan:</strong> {selectedPenumpang?.tujuan}
              </p>
              <p>
                <strong>Tanggal:</strong>{" "}
                {selectedPenumpang?.tanggal
                  ? new Date(selectedPenumpang.tanggal).toLocaleDateString(
                    "id-ID",
                  )
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
                onClick={onClose}
                className="mt-4 bg-gray-500 text-white px-4 py-2 rounded"
              >
                Tutup
              </button>
            </div>
          ) : (
            <form
              ref={formRef}
              action={formAction}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {modalType === "edit" && (
                <input type="hidden" name="id" value={selectedPenumpang?.id} />
              )}
              <FormField label="Nama" id="nama" error={formState.errors?.nama}>
                <input
                  type="text"
                  id="nama"
                  name="nama"
                  defaultValue={selectedPenumpang?.nama}
                  className="w-full px-3 py-2 border rounded text-white focus:ring-2 focus:ring-blue-500"
                  required
                  maxLength={100}
                />
              </FormField>
              <FormField label="Usia" id="usia" error={formState.errors?.usia}>
                <input
                  type="number"
                  id="usia"
                  name="usia"
                  defaultValue={selectedPenumpang?.usia}
                  className="w-full px-3 py-2 border rounded text-white focus:ring-2 focus:ring-blue-500"
                  required
                  min="1"
                  max="150"
                />
              </FormField>
              <FormField label="Jenis Kelamin" id="jenisKelamin" error={formState.errors?.jenisKelamin}>
                <select
                  id="jenisKelamin"
                  name="jenisKelamin"
                  defaultValue={selectedPenumpang?.jenisKelamin || "L"}
                  className="w-full px-3 py-2 border rounded text-white focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option className="text-black" value="L">Laki-laki</option>
                  <option className="text-black" value="P">Perempuan</option>
                </select>
              </FormField>
              <FormField label="Tujuan" id="tujuan" error={formState.errors?.tujuan}>
                <select
                  id="tujuan"
                  name="tujuan"
                  defaultValue={selectedPenumpang?.tujuan || TUJUAN_OPTIONS[0]}
                  className="w-full px-3 py-2 border rounded text-white focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {TUJUAN_OPTIONS.map((opt) => (
                    <option key={opt} value={opt} className="text-black">
                      {opt}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Tanggal" id="tanggal" error={formState.errors?.tanggal}>
                <input
                  type="date"
                  id="tanggal"
                  name="tanggal"
                  defaultValue={
                    selectedPenumpang?.tanggal
                      ? new Date(selectedPenumpang.tanggal)
                        .toISOString()
                        .split("T")[0]
                      : ""
                  }
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 text-white"
                  required
                />
              </FormField>
              <FormField label="No. Polisi" id="nopol" error={formState.errors?.nopol}>
                <input
                  type="text"
                  id="nopol"
                  name="nopol"
                  defaultValue={selectedPenumpang?.nopol}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 text-white"
                  required
                  maxLength={12}
                  style={{ textTransform: "uppercase" }}
                />
              </FormField>
              <FormField label="Jenis Kendaraan" id="jenisKendaraan" error={formState.errors?.jenisKendaraan}>
                <input
                  type="text"
                  id="jenisKendaraan"
                  name="jenisKendaraan"
                  defaultValue={selectedPenumpang?.jenisKendaraan}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 text-white"
                  required
                  maxLength={50}
                />
              </FormField>
              <FormField label="Golongan" id="golongan" error={formState.errors?.golongan}>
                <select
                  id="golongan"
                  name="golongan"
                  defaultValue={selectedPenumpang?.golongan || GOLONGAN_OPTIONS[0]}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 text-white"
                  required
                >
                  {GOLONGAN_OPTIONS.map((opt) => (
                    <option key={opt} value={opt} className="text-black">
                      {opt}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Kapal" id="kapal" error={formState.errors?.kapal}>
                <select
                  id="kapal"
                  name="kapal"
                  defaultValue={selectedPenumpang?.kapal || KAPAL_OPTIONS[0]}
                  className="w-full selection:text-black px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 text-white"
                  required
                >
                  {KAPAL_OPTIONS.map((opt) => (
                    <option key={opt} value={opt} className="text-black">
                      {opt}
                    </option>
                  ))}
                </select>
              </FormField>
              <div className="md:col-span-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Batal
                </button>
                <SubmitButton />
              </div>
            </form>
          )}
        </div>
      </div>
    );
  },
);
PenumpangModal.displayName = "PenumpangModal";
