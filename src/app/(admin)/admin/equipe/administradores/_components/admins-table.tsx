"use client";

import { User } from "@/generated/prisma/client";
import { DataTable } from "../../_components/data-table";
import { useAdminColumns } from "./columns";

export function AdminsTable({
    data,
    title,
    currentUserId,
}: {
    data: User[];
    title?: React.ReactNode;
    currentUserId?: string | null;
}) {
    const columns = useAdminColumns();
    return (
        <DataTable
            columns={columns}
            data={data}
            title={title}
            currentUserId={currentUserId}
        />
    );
}
