"use client";
import { IconPlus, IconDownload, IconTrash } from "@tabler/icons-react";

interface PenumpangActionsProps {
    selectedCount: number;
    onAdd: () => void;
    onExportCSV: () => void;
    onExportPDF: () => void;
    onDeleteSelected: () => void;
}

export const PenumpangActions = ({ selectedCount, onAdd, onExportCSV, onExportPDF, onDeleteSelected }: PenumpangActionsProps) => {
    return (
        <div className="mb-4 grid gap-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            <button onClick={onAdd} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center hover:bg-blue-700">
                <IconPlus className="w-5 h-5 mr-2" />Tambah Data
            </button>

            <button onClick={onExportCSV} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center justify-center hover:bg-green-700">
                <IconDownload className="w-5 h-5 mr-2" />
                {selectedCount > 0 ? `Export Selected (${selectedCount})` : 'Export to CSV'}
            </button>

            <button
                onClick={onExportPDF}
                className="bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center justify-center hover:bg-yellow-700"
            >
                <IconDownload className="w-5 h-5 mr-2" />
                {selectedCount > 0
                    ? `Export Selected (${selectedCount}) to PDF`
                    : 'Export to PDF'
                }
            </button>

            {selectedCount > 0 && (
                <button onClick={onDeleteSelected} className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center justify-center hover:bg-red-700">
                    <IconTrash className="w-5 h-5 mr-2" />Delete Selected ({selectedCount})
                </button>
            )}
        </div>
    );
};