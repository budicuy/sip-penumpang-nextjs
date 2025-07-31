"use client";
import { memo } from 'react';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    isProcessing: boolean;
}

export const ConfirmDialog = memo(({ isOpen, title, message, onConfirm, onCancel, isProcessing }: ConfirmDialogProps) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md">
                <h3 className="text-lg font-semibold mb-2 text-white">{title}</h3>
                <p className="text-gray-400 mb-4">{message}</p>
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