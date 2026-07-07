import {
    Document,
    Image as PdfImage,
    Page,
    StyleSheet,
    Text,
    View,
} from "@react-pdf/renderer";
import { getCorporationName } from "@/lib/corporation-name";
import { getPdfLogoSrc } from "@/lib/export/pdf/assets";
import { registerPdfFonts } from "@/lib/export/pdf/fonts";
import { PdfGeneratedFooter } from "@/lib/export/pdf/generated-footer";
import { PdfTable } from "@/lib/export/pdf/table";
import type { ExportColumnDef } from "@/lib/export/columns";

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
});

export type TeachersListPdfDocumentProps<T> = {
    title: string;
    subtitle: string;
    generatedAt: string;
    rows: T[];
    columns: ExportColumnDef<T>[];
};

export function TeachersListPdfDocument<T>({
    title,
    subtitle,
    generatedAt,
    rows,
    columns,
}: TeachersListPdfDocumentProps<T>) {
    return (
        <Document>
            <Page size="A4" orientation="landscape" style={styles.page}>
                <View style={styles.header}>
                    <PdfImage src={getPdfLogoSrc()} style={styles.logoLuna} />
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.subtitle}>{subtitle}</Text>
                        <Text style={styles.instituteName}>
                            {getCorporationName()}
                        </Text>
                    </View>
                    <PdfImage src={getPdfLogoSrc()} style={styles.logoLuna} />
                </View>
                <PdfTable columns={columns} rows={rows} />
                <PdfGeneratedFooter generatedAt={generatedAt} />
            </Page>
        </Document>
    );
}
