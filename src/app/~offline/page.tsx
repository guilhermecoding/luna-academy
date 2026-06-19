import { IconWifiOff } from "@tabler/icons-react";


export default function OfflinePage() {
    return (
        <main className="flex min-h-full flex-col items-center justify-center gap-4 p-6 text-center">
            <IconWifiOff className="size-16" />
            <h1 className="text-2xl font-semibold">Ops! Você está desconectado</h1>
            <p className="text-muted-foreground max-w-md text-sm">
                Não foi possível carregar esta página. Verifique sua conexão com a internet e tente novamente.
            </p>
        </main>
    );
}
