"use client";
import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useFormState } from "react-dom";
import Papa from "papaparse";
import { usePenumpang } from "./hooks/usePenumpang";
import { PenumpangTable } from "./components/PenumpangTable";
import { PenumpangActions } from "./components/PenumpangActions";
import { PenumpangModal } from "./components/PenumpangModal";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { generatePDFWithJsPDF } from "./utils/pdfGenerator";
import { Penumpang } from "@/types/penumpang";
import { IconSearch, IconX } from "@tabler/icons-react";
import { ITEMS_PER_PAGE_OPTIONS } from "@/app/utils/constants";
import {
  tambahPenumpang,
  updatePenumpang,
  hapusPenumpang,
  hapusPenumpangTerpilih,
  FormState,
} from "./actions";

const initialFormState: FormState = {
  success: false,
  message: "",
};

export default function PenumpangPage() {
  const {
    penumpang,
    totalData,
    isLoading,
    selectedRows,
    searchTerm,
    filterStartDate,
    filterEndDate,
    currentPage,
    itemsPerPage,
    error: fetchError,
    setSearchTerm,
    setFilterStartDate,
    setFilterEndDate,
    setCurrentPage,
    setItemsPerPage,
    handleSelectAll,
    handleSelectRow,
    handleResetFilters,
    setSelectedRows,
    fetchPenumpang,
  } = usePenumpang();

  const [addState, addFormAction] = useFormState(
    tambahPenumpang,
    initialFormState,
  );
  const [updateState, updateFormAction] = useFormState(
    updatePenumpang,
    initialFormState,
  );

  const [selectedPenumpang, setSelectedPenumpang] = useState<Penumpang | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"add" | "edit" | "view">("add");
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    id: "",
    type: "single",
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const formRef = useRef<HTMLFormElement>(null);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setSelectedPenumpang(null);
    formRef.current?.reset();
    addState.message = "";
    updateState.message = "";
    addState.errors = {};
    updateState.errors = {};
  }, [addState, updateState]);

  useEffect(() => {
    if (addState.success) {
      setSuccessMessage(addState.message);
      handleModalClose();
    } else if (addState.message) {
      setErrorMessage(addState.message);
    }
  }, [addState, handleModalClose]);

  useEffect(() => {
    if (updateState.success) {
      setSuccessMessage(updateState.message);
      handleModalClose();
    } else if (updateState.message) {
      setErrorMessage(updateState.message);
    }
  }, [updateState, handleModalClose]);

  const pdfExportData = useMemo(() => {
    return selectedRows.size > 0
      ? penumpang.filter((p) => selectedRows.has(p.id))
      : penumpang;
  }, [selectedRows, penumpang]);

  const totalPages = Math.ceil(totalData / itemsPerPage);
  const selectedCount = selectedRows.size;

  const handleModalOpen = useCallback(
    (type: "add" | "edit" | "view", penumpang?: Penumpang) => {
      setModalType(type);
      setSelectedPenumpang(penumpang || null);
      setIsModalOpen(true);
      setErrorMessage(null);
      setSuccessMessage(null);
    },
    [],
  );

  const handleDelete = useCallback((id: string) => {
    setConfirmDialog({ isOpen: true, id, type: "single" });
  }, []);

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      let result: FormState;
      if (confirmDialog.type === "single") {
        result = await hapusPenumpang(parseInt(confirmDialog.id, 10));
      } else {
        const ids = Array.from(selectedRows).map((id) => parseInt(id, 10));
        result = await hapusPenumpangTerpilih(ids);
        if (result.success) {
          setSelectedRows(new Set());
        }
      }

      if (result.success) {
        setSuccessMessage(result.message);
      } else {
        setErrorMessage(result.message);
      }
    } catch {
      setErrorMessage("Gagal menghapus data.");
    } finally {
      setIsDeleting(false);
      setConfirmDialog({ isOpen: false, id: "", type: "single" });
    }
  };

  const handleDeleteSelected = () => {
    setConfirmDialog({ isOpen: true, id: "", type: "multiple" });
  };

  const handleExportCSV = useCallback(async () => {
    try {
      let dataToExport: Penumpang[] = [];
      if (selectedCount > 0) {
        dataToExport = penumpang.filter((p) => selectedRows.has(p.id));
      } else {
        const response = await fetch(
          `/api/penumpang?limit=${Math.max(1000, totalData)}`,
        );
        if (!response.ok) {
          let errorMessage = "Gagal mengambil data untuk export";
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch {}
          throw new Error(errorMessage);
        }
        const result = await response.json();
        dataToExport = result.data || [];
      }

      if (dataToExport.length === 0) {
        setErrorMessage("Tidak ada data untuk di-export");
        return;
      }

      const csvData = dataToExport.map((p, index) => ({
        No: index + 1,
        Nama: p.nama || "-",
        Usia: p.usia || "-",
        "Jenis Kelamin": p.jenisKelamin === "L" ? "Laki-laki" : "Perempuan",
        Tujuan: p.tujuan || "-",
        Tanggal: p.tanggal
          ? new Date(p.tanggal).toLocaleDateString("id-ID")
          : "-",
        "No. Polisi": p.nopol || "-",
        "Jenis Kendaraan": p.jenisKendaraan || "-",
        Golongan: p.golongan || "-",
        Kapal: p.kapal || "-",
      }));

      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `penumpang_${new Date().toISOString().split("T")[0]}.csv`,
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccessMessage(`${dataToExport.length} data berhasil di-export ke CSV`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(`Export gagal: ${err.message}`);
      } else {
        setErrorMessage("Gagal export data ke CSV");
      }
    }
  }, [selectedRows, selectedCount, penumpang, totalData]);

  const allChecked =
    penumpang.length > 0 && penumpang.every((item) => selectedRows.has(item.id));
  const handleEdit = useCallback(
    (item: Penumpang) => handleModalOpen("edit", item),
    [handleModalOpen],
  );
  const handleView = useCallback(
    (item: Penumpang) => handleModalOpen("view", item),
    [handleModalOpen],
  );

  const formAction = modalType === "add" ? addFormAction : updateFormAction;

  return (
    <div>
      <h1 className="text-2xl lg:text-4xl font-bold text-black mb-5">
        Manifest Data Penumpang
      </h1>

      {fetchError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              ></path>
            </svg>
            <span>{fetchError}</span>
          </div>
          <button
            onClick={() => fetchPenumpang()}
            className="ml-4 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Manifest Data Penumpang ({totalData} data)
        </h2>

        <PenumpangActions
          selectedCount={selectedCount}
          onAdd={() => handleModalOpen("add")}
          onExportCSV={handleExportCSV}
          onExportPDF={() => generatePDFWithJsPDF(pdfExportData)}
          onDeleteSelected={handleDeleteSelected}
        />

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
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            </div>
          )}
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              title="Hapus pencarian"
            >
              <IconX className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label
              htmlFor="filterStartDate"
              className="block text-gray-700 mb-1"
            >
              Dari Tanggal
            </label>
            <input
              type="date"
              placeholder="Pilih tanggal mulai"
              id="filterStartDate"
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="filterEndDate"
              className="block text-gray-700 mb-1"
            >
              Sampai Tanggal
            </label>
            <input
              type="date"
              placeholder="Pilih tanggal akhir"
              id="filterEndDate"
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="itemsPerPage" className="block text-gray-700 mb-1">
              Data per Halaman
            </label>
            <select
              id="itemsPerPage"
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            >
              {ITEMS_PER_PAGE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
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
            <div>
              Menampilkan {penumpang.length} dari {totalData} data
              {selectedCount > 0 && (
                <span className="ml-2 text-blue-600 font-medium">
                  • {selectedCount} dipilih
                </span>
              )}
            </div>
            {(searchTerm || filterStartDate || filterEndDate) && (
              <div className="text-xs text-gray-500 mt-1">
                {searchTerm && `Pencarian: "${searchTerm}"`}
                {filterStartDate && ` | Dari: ${filterStartDate}`}
                {filterEndDate && ` | Sampai: ${filterEndDate}`}
              </div>
            )}
            <div className="text-xs text-gray-500 mt-1">
              Tip: Klik baris untuk memilih/batal memilih data
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100 transition-colors"
            >
              «
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100 transition-colors"
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
              className="w-16 px-2 py-1 border rounded text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="1"
              max={totalPages}
            />
            <span className="px-2">/ {totalPages}</span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100 transition-colors"
            >
              ›
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100 transition-colors"
            >
              »
            </button>
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
          searchTerm={searchTerm}
          filterStartDate={filterStartDate}
          filterEndDate={filterEndDate}
          onResetFilters={handleResetFilters}
        />
      </div>

      <PenumpangModal
        isModalOpen={isModalOpen}
        modalType={modalType}
        selectedPenumpang={selectedPenumpang}
        onClose={handleModalClose}
        formAction={formAction}
        formState={modalType === "add" ? addState : updateState}
        formRef={formRef}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Konfirmasi Hapus"
        message={
          confirmDialog.type === "single"
            ? "Apakah Anda yakin ingin menghapus data ini?"
            : `Apakah Anda yakin ingin menghapus ${selectedCount} data yang dipilih?`
        }
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDialog({ isOpen: false, id: "", type: "single" })}
        isProcessing={isDeleting}
      />
    </div>
  );
}
