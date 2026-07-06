import { StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ExportColumnDef } from "@/lib/export/columns";

const PRIMARY_COLOR = "#432DD7";
const BORDER_COLOR = "#e5e7eb";
const ROW_ALT_COLOR = "#f8fafc";
const TEXT_COLOR = "#1e293b";

const styles = StyleSheet.create({
    headerRow: {
        flexDirection: "row",
        backgroundColor: PRIMARY_COLOR,
        paddingVertical: 8,
        paddingHorizontal: 6,
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
    },
    headerCell: {
        color: "#ffffff",
        fontSize: 9,
        fontWeight: "bold",
        fontFamily: "Roboto",
    },
    row: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: BORDER_COLOR,
        paddingVertical: 6,
        paddingHorizontal: 6,
    },
    rowAlt: {
        backgroundColor: ROW_ALT_COLOR,
    },
    cell: {
        fontSize: 8,
        color: TEXT_COLOR,
        fontFamily: "Roboto",
    },
});

function getColumnWidth<T>(column: ExportColumnDef<T>, columnCount: number): string {
    return column.width ?? `${100 / columnCount}%`;
}

export function PdfTable<T>({
    columns,
    rows,
}: {
    columns: ExportColumnDef<T>[];
    rows: T[];
}) {
    return (
        <View>
            <View style={styles.headerRow}>
                {columns.map((column) => (
                    <Text
                        key={column.key}
                        style={[styles.headerCell, { width: getColumnWidth(column, columns.length) }]}
                    >
                        {column.header}
                    </Text>
                ))}
            </View>
            {rows.map((row, index) => (
                <View
                    key={index}
                    style={[styles.row, index % 2 === 1 ? styles.rowAlt : {}]}
                >
                    {columns.map((column) => (
                        <Text
                            key={column.key}
                            style={[styles.cell, { width: getColumnWidth(column, columns.length) }]}
                        >
                            {String(column.value(row) ?? "")}
                        </Text>
                    ))}
                </View>
            ))}
        </View>
    );
}
