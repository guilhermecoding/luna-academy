export type ExportColumnDef<T> = {
    key: string;
    header: string;
    value: (row: T) => string | number | null | undefined;
    width?: string;
};
