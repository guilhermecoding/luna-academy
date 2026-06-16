"use client";

import { UserListItem } from "@/services/users/users.service";
import { DataTable } from "./data-table";
import { useTeamColumns } from "./columns";

export function TeamTable({
    data,
    title,
    currentUserId,
}: {
    data: UserListItem[];
    title?: React.ReactNode;
    currentUserId?: string | null;
}) {
    const columns = useTeamColumns();
    return (
        <DataTable
            columns={columns}
            data={data}
            title={title}
            currentUserId={currentUserId}
        />
    );
}
