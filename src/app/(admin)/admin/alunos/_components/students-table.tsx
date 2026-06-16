"use client";

import { StudentListItem } from "@/services/students/students.service";
import { DataTable } from "./data-table";
import { useStudentColumns } from "./columns";

export function StudentsTable({
    data,
    title,
}: {
    data: StudentListItem[];
    title?: React.ReactNode;
}) {
    const columns = useStudentColumns();
    return <DataTable columns={columns} data={data} title={title} />;
}
