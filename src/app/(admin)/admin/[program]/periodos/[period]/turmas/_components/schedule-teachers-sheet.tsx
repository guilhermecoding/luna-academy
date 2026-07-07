"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { IconSearch, IconSelector } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import {
    formatScheduleTeachersLabel,
    type ScheduleTeacherEntry,
} from "@/lib/schedule-teacher-utils";

type TeacherOption = {
    id: string;
    name: string;
    email: string;
};

type ScheduleTeachersSheetProps = {
    value: ScheduleTeacherEntry[];
    onChange: (teachers: ScheduleTeacherEntry[]) => void;
    teachers: TeacherOption[];
    disabled?: boolean;
};

export function ScheduleTeachersSheet({
    value,
    onChange,
    teachers,
    disabled = false,
}: ScheduleTeachersSheetProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");

    const teacherNames = useMemo(
        () => new Map(teachers.map((t) => [t.id, t.name])),
        [teachers],
    );

    const filteredTeachers = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return teachers;
        return teachers.filter(
            (t) =>
                t.name.toLowerCase().includes(q) ||
                t.email.toLowerCase().includes(q),
        );
    }, [teachers, query]);

    const selectedIds = useMemo(() => new Set(value.map((t) => t.teacherId)), [value]);

    const visibleValue = useMemo(
        () => value.filter((entry) => teacherNames.has(entry.teacherId)),
        [value, teacherNames],
    );

    const label = formatScheduleTeachersLabel(visibleValue, teacherNames);

    const toggleTeacher = (teacherId: string, checked: boolean) => {
        if (checked) {
            const isFirst = value.length === 0;
            onChange([
                ...value,
                { teacherId, role: isFirst ? "TITULAR" : "ASSISTENTE" },
            ]);
            return;
        }

        const remaining = value.filter((t) => t.teacherId !== teacherId);
        const hadTitular = value.some((t) => t.teacherId === teacherId && t.role === "TITULAR");
        if (hadTitular && remaining.length > 0 && !remaining.some((t) => t.role === "TITULAR")) {
            onChange(
                remaining.map((t, i) => (i === 0 ? { ...t, role: "TITULAR" as const } : t)),
            );
            return;
        }
        onChange(remaining);
    };

    const setAsTitular = (teacherId: string) => {
        onChange(
            value.map((t) => ({
                ...t,
                role: t.teacherId === teacherId ? "TITULAR" : "ASSISTENTE",
            })),
        );
    };

    return (
        <>
            <Button
                type="button"
                variant="outline"
                size="lg"
                disabled={disabled || teachers.length === 0}
                onClick={() => setOpen(true)}
                className={cn(
                    "h-8 min-w-0 rounded-lg bg-background w-full justify-between px-3 py-0 text-sm font-normal overflow-hidden",
                    !visibleValue.length && "text-muted-foreground",
                )}
            >
                <span className="truncate">
                    {teachers.length === 0 ? "Nenhum professor cadastrado" : label}
                </span>
                <IconSelector className="size-4 shrink-0 opacity-50" />
            </Button>

            <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent className="flex flex-col w-full sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle>Professores do horário</SheetTitle>
                        <SheetDescription>
                            Selecione o titular e os assistentes deste slot.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="relative px-1 mb-6">
                        <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar professor..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="pl-10 h-10"
                        />
                    </div>

                    {visibleValue.length > 0 && (
                        <div className="space-y-2 px-1">
                            <Label className="text-xs text-muted-foreground">Selecionados</Label>
                            <div className="flex flex-col gap-2">
                                {visibleValue.map((entry) => {
                                    const teacher = teachers.find((t) => t.id === entry.teacherId);
                                    if (!teacher) return null;
                                    return (
                                        <div
                                            key={entry.teacherId}
                                            className="flex items-center justify-between gap-2 rounded-lg border border-surface-border p-2"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium truncate">{teacher.name}</p>
                                                <p className="text-xs text-muted-foreground truncate">{teacher.email}</p>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <Badge
                                                    variant={entry.role === "TITULAR" ? "default" : "secondary"}
                                                >
                                                    {entry.role === "TITULAR" ? "Titular" : "Assistente"}
                                                </Badge>
                                                {entry.role !== "TITULAR" && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 text-xs"
                                                        onClick={() => setAsTitular(entry.teacherId)}
                                                    >
                                                        Tornar titular
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <ScrollArea className="flex-1 min-h-0 -mx-1 px-1">
                        <div className="space-y-1 pb-4">
                            {filteredTeachers.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">
                                    Nenhum professor encontrado.
                                </p>
                            ) : (
                                filteredTeachers.map((teacher) => (
                                    <label
                                        key={teacher.id}
                                        className="flex items-center gap-3 rounded-lg p-3 hover:bg-muted/50 cursor-pointer"
                                    >
                                        <Checkbox
                                            checked={selectedIds.has(teacher.id)}
                                            onChange={(e) =>
                                                toggleTeacher(teacher.id, e.target.checked)
                                            }
                                        />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium truncate">{teacher.name}</p>
                                            <p className="text-xs text-muted-foreground truncate">{teacher.email}</p>
                                        </div>
                                    </label>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </SheetContent>
            </Sheet>
        </>
    );
}
