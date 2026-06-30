import { StyleSheet, Text } from "@react-pdf/renderer";
import { getCorporationName } from "@/lib/corporation-name";

const styles = StyleSheet.create({
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

export function PdfGeneratedFooter({ generatedAt }: { generatedAt: string }) {
    return (
        <Text style={styles.footer} fixed>
            Gerado em {generatedAt} · {getCorporationName()}
        </Text>
    );
}
