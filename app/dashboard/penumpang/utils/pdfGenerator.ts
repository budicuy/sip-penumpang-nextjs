import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Penumpang } from "@/types/penumpang";

export const generatePDFWithJsPDF = (data: Penumpang[]) => {
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
            hour12: false
        };
        const dateStr = `Tanggal: ${now.toLocaleDateString('id-ID', options)} WITA`;

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

    if (availableSpace < signatureHeight) {
        doc.addPage();
        addHeader();
        const signatureY = 60;
        doc.setFontSize(12);
        const pageWidthForSignature = doc.internal.pageSize.getWidth();
        const leftSignature = pageWidthForSignature * 0.25;
        const rightSignature = pageWidthForSignature * 0.75;
        doc.text('Petugas', leftSignature, signatureY, { align: 'center' });
        doc.text('Nahkoda', rightSignature, signatureY, { align: 'center' });
        doc.text('(...............................)', leftSignature, signatureY + 25, { align: 'center' });
        doc.text('(...............................)', rightSignature, signatureY + 25, { align: 'center' });
    } else {
        const signatureY = finalY + 25;
        doc.setFontSize(12);
        const pageWidthForSignature = doc.internal.pageSize.getWidth();
        const leftSignature = pageWidthForSignature * 0.25;
        const rightSignature = pageWidthForSignature * 0.75;
        doc.text('Petugas', leftSignature, signatureY, { align: 'center' });
        doc.text('Nahkoda', rightSignature, signatureY, { align: 'center' });
        doc.text('(...............................)', leftSignature, signatureY + 25, { align: 'center' });
        doc.text('(...............................)', rightSignature, signatureY + 25, { align: 'center' });
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