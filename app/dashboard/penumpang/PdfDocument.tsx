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
        width: "auto",
        borderStyle: "solid",
        borderWidth: 1,
        borderRightWidth: 0,
        borderBottomWidth: 0,
    },
    tableRow: {
        flexDirection: "row",
    },
    tableColHeader: {
        borderStyle: "solid",
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        padding: 5,
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 9,
        backgroundColor: 'yellow',
    },
    tableCol: {
        borderStyle: "solid",
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        padding: 5,
        fontSize: 9,
    },
    col1: { width: "5%", },
    col2: { width: "10%", },
    col3: { width: "7%" },
    col4: { width: "5%" },
    col5: { width: "10%" },
    col6: { width: "10%" },
    col7: { width: "7%" },
    col8: { width: "10%" },
    col9: { width: "14%" },
    col10: { width: "10%" },
    col11: { width: "12%" },
    footer: {
        marginTop: 50,
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
        marginTop: 50,
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

const PdfDocument: React.FC<PdfDocumentProps> = ({ data }) => (
    <Document>
        <Page size="A4" orientation="landscape" style={styles.page}>
            <Text style={styles.title}>MANIFEST DATA PENUMPANG</Text>
            <Text style={styles.dateTime}>Tanggal : Senin, 17-08-2025, 08:00 AM</Text>
            <View style={styles.table}>
                <View style={styles.tableRow}>
                    <Text style={[styles.tableColHeader, styles.col1]}>NO</Text>
                    <Text style={[styles.tableColHeader, styles.col2]}>Nama</Text>
                    <Text style={[styles.tableColHeader, styles.col3]}>Usia</Text>
                    <Text style={[styles.tableColHeader, styles.col4]}>JK</Text>
                    <Text style={[styles.tableColHeader, styles.col5]}>Tujuan</Text>
                    <Text style={[styles.tableColHeader, styles.col6]}>Tanggal</Text>
                    <Text style={[styles.tableColHeader, styles.col8]}>Nopol</Text>
                    <Text style={[styles.tableColHeader, styles.col9]}>Jenis Kendaraan</Text>
                    <Text style={[styles.tableColHeader, styles.col10]}>Golongan</Text>
                    <Text style={[styles.tableColHeader, styles.col11]}>Kapal</Text>
                </View>
                {data.map((item, index) => (
                    <View style={styles.tableRow} key={item.id}>
                        <Text style={[styles.tableCol, styles.col1]}>{index + 1}</Text>
                        <Text style={[styles.tableCol, styles.col2]}>{item.nama}</Text>
                        <Text style={[styles.tableCol, styles.col3]}>{item.usia}</Text>
                        <Text style={[styles.tableCol, styles.col4]}>{item.jenisKelamin.charAt(0).toUpperCase()}</Text>
                        <Text style={[styles.tableCol, styles.col5]}>{item.tujuan}</Text>
                        <Text style={[styles.tableCol, styles.col6]}>
                            {new Date(item.tanggal).toLocaleDateString('id-ID')}
                        </Text>
                        <Text style={[styles.tableCol, styles.col8]}>{item.nopol}</Text>
                        <Text style={[styles.tableCol, styles.col9]}>{item.jenisKendaraan}</Text>
                        <Text style={[styles.tableCol, styles.col10]}>{item.golongan}</Text>
                        <Text style={[styles.tableCol, styles.col11]}>{item.kapal}</Text>
                    </View>
                ))}
            </View>
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
        </Page>
    </Document>
);

export default PdfDocument;