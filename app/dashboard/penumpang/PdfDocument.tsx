import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        padding: 50,
        fontSize: 10,
    },
    title: {
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 10,
        fontWeight: 'bold',
        textDecoration: 'underline',
    },
    dateTime: {
        fontSize: 11,
        textAlign: 'right',
        marginBottom: 20,
    },
    table: {
        width: "100%",
        borderStyle: "solid",
        borderWidth: 1,
        borderRightWidth: 0,
        borderBottomWidth: 0,
    },
    tableRow: {
        flexDirection: "row",
        minHeight: 20,
    },
    tableColHeader: {
        borderStyle: "solid",
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        padding: 5,
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 6,
        backgroundColor: 'yellow',
    },
    tableCol: {
        borderStyle: "solid",
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        padding: 5,
        fontSize: 6,
    },
    col1: {
        width: "5%",
        textAlign: 'center',
    },
    col2: {
        width: "15%",
        lineHeight: 1.2,
    },
    col3: {
        width: "6%",
        textAlign: 'center',
    },
    col4: {
        width: "4%",
        textAlign: 'center',
    },
    col5: {
        width: "10%",
        textAlign: 'center',
    },
    col6: {
        width: "9%",
        textAlign: 'center',
    },
    col7: { width: "10%" },
    col8: { width: "15%" },
    col9: {
        width: "10%",
        textAlign: 'center',
    },
    col10: { width: "16%" },
    footer: {
        marginTop: 30,
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    signatureContainer: {
        width: '40%',
        alignItems: 'center',
    },
    signature: {
        textAlign: 'center',
        fontSize: 12,
    },
    dottedLine: {
        marginTop: 30,
        marginBottom: 10,
        fontSize: 12,
        textAlign: 'center',
    }
});

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

interface PdfDocumentProps {
    data: Penumpang[];
}

const chunkArray = <T,>(array: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
};

const wrapText = (text: string, maxLength: number = 12): string => {
    if (text.length <= maxLength) return text;

    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach(word => {
        if ((currentLine + word).length <= maxLength) {
            currentLine += (currentLine ? ' ' : '') + word;
        } else {
            if (currentLine) lines.push(currentLine);
            currentLine = word;
        }
    });

    if (currentLine) lines.push(currentLine);
    return lines.join('\n');
};

const formatDateTime = () => {
    const now = new Date();
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const day = days[now.getDay()];
    const date = now.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return `Tanggal : ${day}, ${date}, ${time}`;
};

const Header = () => (
    <>
        <Text style={styles.title}>MANIFEST DATA PENUMPANG</Text>
        <Text style={styles.dateTime}>{formatDateTime()}</Text>
    </>
);

const TableHeader = () => (
    <View style={styles.tableRow}>
        <Text style={[styles.tableColHeader, styles.col1]}>NO</Text>
        <Text style={[styles.tableColHeader, styles.col2]}>Nama</Text>
        <Text style={[styles.tableColHeader, styles.col3]}>Usia</Text>
        <Text style={[styles.tableColHeader, styles.col4]}>JK</Text>
        <Text style={[styles.tableColHeader, styles.col5]}>Tujuan</Text>
        <Text style={[styles.tableColHeader, styles.col6]}>Tanggal</Text>
        <Text style={[styles.tableColHeader, styles.col7]}>Nopol</Text>
        <Text style={[styles.tableColHeader, styles.col8]}>Jenis Kendaraan</Text>
        <Text style={[styles.tableColHeader, styles.col9]}>Golongan</Text>
        <Text style={[styles.tableColHeader, styles.col10]}>Kapal</Text>
    </View>
);

const Footer = () => (
    <View style={styles.footer}>
        <View style={styles.signatureContainer}>
            <Text style={styles.signature}>Petugas</Text>
            <Text style={styles.dottedLine}>(...........................................)</Text>
        </View>
        <View style={styles.signatureContainer}>
            <Text style={styles.signature}>Nahkoda</Text>
            <Text style={styles.dottedLine}>(...........................................)</Text>
        </View>
    </View>
);

const PdfDocument: React.FC<PdfDocumentProps> = ({ data }) => {
    const itemsPerPage = 20;
    const dataChunks = chunkArray(data, itemsPerPage);

    return (
        <Document>
            {dataChunks.map((chunk, pageIndex) => (
                <Page key={pageIndex} size="A4" style={styles.page}>
                    <Header />
                    <View style={styles.table}>
                        <TableHeader />
                        {chunk.map((item, index) => (
                            <View style={styles.tableRow} key={item.id}>
                                <Text style={[styles.tableCol, styles.col1]}>{pageIndex * itemsPerPage + index + 1}</Text>
                                <Text style={[styles.tableCol, styles.col2]}>{wrapText(item.nama)}</Text>
                                <Text style={[styles.tableCol, styles.col3]}>{item.usia}</Text>
                                <Text style={[styles.tableCol, styles.col4]}>{item.jenisKelamin.charAt(0).toUpperCase()}</Text>
                                <Text style={[styles.tableCol, styles.col5]}>{item.tujuan}</Text>
                                <Text style={[styles.tableCol, styles.col6]}>
                                    {new Date(item.tanggal).toLocaleDateString('id-ID')}
                                </Text>
                                <Text style={[styles.tableCol, styles.col7]}>{item.nopol}</Text>
                                <Text style={[styles.tableCol, styles.col8]}>{item.jenisKendaraan}</Text>
                                <Text style={[styles.tableCol, styles.col9]}>{item.golongan}</Text>
                                <Text style={[styles.tableCol, styles.col10]}>{item.kapal}</Text>
                            </View>
                        ))}
                    </View>
                    {pageIndex === dataChunks.length - 1 && <Footer />}
                </Page>
            ))}
        </Document>
    );
};

export default PdfDocument;