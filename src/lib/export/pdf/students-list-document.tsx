import {
    Document,
    Image as PdfImage,
    Page,
    StyleSheet,
    Text,
    View,
} from "@react-pdf/renderer";
import { getPdfLogoSrc } from "@/lib/export/pdf/assets";
import { registerPdfFonts } from "@/lib/export/pdf/fonts";
import { PdfTable } from "@/lib/export/pdf/table";
import {
    STUDENTS_EXPORT_COLUMNS,
    type StudentExportRow,
} from "@/services/export/students-export.config";

registerPdfFonts();

const styles = StyleSheet.create({
    header: {
        alignItems: "center",
        gap: 8,
        display: "flex",
        flexDirection: "row",
        marginBottom: 16,
    },
    page: {
        padding: 32,
        paddingBottom: 48,
        fontFamily: "Roboto",
        fontSize: 10,
        color: "#1e293b",
    },
    logoLuna: {
        width: 64,
    },
    titleContainer: {
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 4,
        fontFamily: "Roboto",
    },
    subtitle: {
        fontSize: 10,
        color: "#64748b",
        fontFamily: "Roboto",
    },
    instituteName: {
        fontSize: 12,
        color: "#1e293b",
        fontFamily: "Roboto",
        fontWeight: "medium",
    },
    footer: {
        position: "absolute",
        bottom: 24,
        left: 32,
        right: 32,
        fontSize: 8,
        color: "#94a3b8",
        textAlign: "center",
        fontFamily: "Roboto",
    },
});

export type StudentsListPdfDocumentProps = {
    title: string;
    subtitle: string;
    generatedAt: string;
    rows: StudentExportRow[];
};

export function StudentsListPdfDocument({
    title,
    subtitle,
    generatedAt,
    rows,
}: StudentsListPdfDocumentProps) {
    return (
        <Document>
            <Page size="A4" orientation="landscape" style={styles.page}>
                <View style={styles.header}>
                    <PdfImage src={getPdfLogoSrc()} style={styles.logoLuna} />
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.subtitle}>{subtitle}</Text>
                        <Text style={styles.instituteName}>
                            Instituto Uberhub Educação
                        </Text>
                    </View>
                    <PdfImage src={getPdfLogoSrc()} style={styles.logoLuna} />
                </View>
                <PdfTable columns={STUDENTS_EXPORT_COLUMNS} rows={rows} />
                <Text style={styles.footer} fixed>
                    Gerado em {generatedAt} · Luna Academy
                </Text>
            </Page>
        </Document>
    );
}
