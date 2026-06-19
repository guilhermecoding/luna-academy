"use client";

import { User } from "@/generated/prisma/client";
import { DataTable } from "../../_components/data-table";
import { useTeacherColumns } from "./columns";

export function TeachersTable({
    data,
    title,
}: {
    data: User[];
    title?: React.ReactNode;
}) {
    const columns = useTeacherColumns();
    return <DataTable columns={columns} data={data} title={title} />;
}
