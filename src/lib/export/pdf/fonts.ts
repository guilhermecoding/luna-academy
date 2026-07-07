import { Font } from "@react-pdf/renderer";
import { getPdfFontPath } from "@/lib/export/pdf/assets";

let fontsRegistered = false;

export function registerPdfFonts() {
    if (fontsRegistered) {
        return;
    }

    Font.register({
        family: "Roboto",
        fonts: [
            {
                src: getPdfFontPath("Roboto-Regular.ttf"),
                fontWeight: "normal",
            },
            {
                src: getPdfFontPath("Roboto-Bold.ttf"),
                fontWeight: "bold",
            },
        ],
    });

    fontsRegistered = true;
}
