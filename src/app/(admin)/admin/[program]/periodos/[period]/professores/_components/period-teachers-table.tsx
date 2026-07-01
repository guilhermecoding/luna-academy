"use client";

import { useCallback, useState, useTransition } from "react";
import { User } from "@/generated/prisma/client";
import { DataTable } from "@/app/(admin)/admin/equipe/_components/data-table";
import { usePeriodTeacherColumns } from "./columns-period-teachers";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { IconUserScreen, IconLoader2, IconPointFilled } from "@tabler/icons-react";
import { Separator } from "@/components/ui/separator";
import { getTeacherPeriodAssignmentsAction } from "../actions";
import type { TeacherPeriodAssignment } from "@/services/users/teachers.service";
import { toast } from "sonner";

interface PeriodTeachersTableProps {
    data: User[];
    periodId: string;
    title?: React.ReactNode;
}

export function PeriodTeachersTable({ data, periodId, title }: PeriodTeachersTableProps) {
    const [sheetTeacher, setSheetTeacher] = useState<User | null>(null);
    const [assignments, setAssignments] = useState<TeacherPeriodAssignment[]>([]);
    const [isPending, startTransition] = useTransition();

    const handleAssignmentsClick = useCallback((teacher: User) => {
        setSheetTeacher(teacher);
        setAssignments([]);

        startTransition(async () => {
            const res = await getTeacherPeriodAssignmentsAction({
                periodId,
                teacherId: teacher.id,
            });

            if (res.success && res.assignments) {
                setAssignments(res.assignments);
                return;
            }

            toast.error(res.error ?? "Erro ao buscar vínculos do professor.");
        });
    }, [periodId]);

    const handleClose = useCallback(() => {
        setSheetTeacher(null);
        setAssignments([]);
    }, []);

    const columns = usePeriodTeacherColumns({ onAssignmentsClick: handleAssignmentsClick });

    return (
        <div className="space-y-4">
            <Sheet
                open={sheetTeacher !== null}
                onOpenChange={(open) => {
                    if (!open) handleClose();
                }}
            >
                <SheetContent
                    side="right"
                    className="data-[side=right]:w-full data-[side=right]:sm:max-w-md flex flex-col gap-0 border-l-surface-border bg-surface p-0"
                >
                    <SheetHeader className="p-4 sm:p-6 border-b border-surface-border shrink-0 text-left space-y-2">
                        <SheetTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
                            <IconUserScreen className="size-5 sm:size-6 shrink-0" />
                            Turmas e Disciplinas
                        </SheetTitle>
                        <SheetDescription>
                            {sheetTeacher ? (
                                <span className="text-foreground font-medium">{sheetTeacher.name}</span>
                            ) : null}
                        </SheetDescription>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                        {isPending && (
                            <div className="flex items-center justify-center py-8">
                                <IconLoader2 className="size-6 animate-spin text-muted-foreground" />
                            </div>
                        )}
                        {!isPending && sheetTeacher && assignments.length === 0 && (
                            <p className="text-sm text-muted-foreground">
                                Este professor não está vinculado a nenhuma turma neste período.
                            </p>
                        )}
                        {!isPending && assignments.length > 0 && (
                            <div className="flex flex-col">
                                {assignments.map((group, index) => (
                                    <div key={group.id}>
                                        {index > 0 && <Separator className="my-4" />}
                                        <div className="space-y-2">
                                            <h3 className="text-sm font-semibold text-foreground">{group.name}</h3>
                                            <ul className="flex flex-col gap-1">
                                                {group.courses.map((course) => (
                                                    <li
                                                        key={`${group.id}-${course.name}`}
                                                        className="text-sm text-muted-foreground flex items-center gap-2"
                                                    >
                                                        <IconPointFilled className="size-4" /> {course.name}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </SheetContent>
            </Sheet>

            <DataTable columns={columns} data={data} title={title} />
        </div>
    );
}
