export default function OfflinePage() {
    return (
        <main className="flex min-h-full flex-col items-center justify-center gap-4 p-6 text-center">
            <h1 className="text-2xl font-semibold">Você está offline</h1>
            <p className="text-muted-foreground max-w-md text-sm">
                Não foi possível carregar esta página. Verifique sua conexão e tente novamente.
            </p>
        </main>
    );
}
