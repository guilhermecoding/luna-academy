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
import {
    STUDENTS_EXPORT_COLUMNS,
    type StudentExportRow,
} from "@/services/export/students-export.config";
import type { CourseTeachersExport } from "@/services/export/course-students.export";

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
    teachersBlock: {
        marginBottom: 12,
        gap: 4,
    },
    teachersLine: {
        fontSize: 9,
        color: "#475569",
        fontFamily: "Roboto",
    },
});

export type StudentsListPdfDocumentProps = {
    title: string;
    subtitle: string;
    generatedAt: string;
    rows: StudentExportRow[];
    teachers?: CourseTeachersExport;
};

export function StudentsListPdfDocument({
    title,
    subtitle,
    generatedAt,
    rows,
    teachers,
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
                            {getCorporationName()}
                        </Text>
                    </View>
                    <PdfImage src={getPdfLogoSrc()} style={styles.logoLuna} />
                </View>
                {teachers && (
                    <View style={styles.teachersBlock}>
                        <Text style={styles.teachersLine}>
                            Professor(es) titular(es): {teachers.titular ?? "—"}
                        </Text>
                        <Text style={styles.teachersLine}>
                            Assistentes: {teachers.assistants.length > 0 ? teachers.assistants.join(", ") : "—"}
                        </Text>
                    </View>
                )}
                <PdfTable columns={STUDENTS_EXPORT_COLUMNS} rows={rows} />
                <PdfGeneratedFooter generatedAt={generatedAt} />
            </Page>
        </Document>
    );
}
