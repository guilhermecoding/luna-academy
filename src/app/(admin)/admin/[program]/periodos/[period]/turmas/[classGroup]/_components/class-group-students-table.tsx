"use client";

import { StudentListItem } from "@/services/students/students.service";
import { DataTableClassStudents } from "./data-table-class-students";
import { useClassGroupStudentColumns } from "../../../alunos/_components/columns-period";

export function ClassGroupStudentsTable({
    data,
    title,
    periodId,
    classGroupId,
    canWrite,
}: {
    data: StudentListItem[];
    title?: React.ReactNode;
    periodId: string;
    classGroupId: string;
    canWrite?: boolean;
}) {
    const columns = useClassGroupStudentColumns();
    return (
        <DataTableClassStudents
            columns={columns}
            data={data}
            title={title}
            periodId={periodId}
            classGroupId={classGroupId}
            canWrite={canWrite}
        />
    );
}
