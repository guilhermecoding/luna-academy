export function createPdfResponse(buffer: Buffer, filename: string): Response {
    return new Response(new Uint8Array(buffer), {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${filename}"`,
        },
    });
}
