"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
} from "@/components/ui/sheet";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { IconEdit, IconLoader2, IconCalendarEvent, IconTrash } from "@tabler/icons-react";
import { toast } from "sonner";
import { updateLessonAction, deleteLessonAction, createLessonAction } from "../actions";
import { useCanWrite } from "@/components/write-access-provider";

export type ScheduleOption = {
    id: string;
    dayOfWeek: string;
    timeSlotId: string;
    timeSlotName: string;
    startTime: string;
    endTime: string;
    teacherId: string | null;
    teacherName: string | null;
};

interface EditLessonSheetProps {
    programSlug: string;
    periodSlug: string;
    classGroupSlug: string;
    courseCode: string;
    schedules: ScheduleOption[];
    lesson: {
        id: string;
        date: Date | string;
        topic: string;
        scheduleId?: string | null;
    };
    children: React.ReactNode;
    canWrite?: boolean;
}

const dayOfWeekLabels: Record<string, string> = {
    MONDAY: "Segunda-feira",
    TUESDAY: "Terça-feira",
    WEDNESDAY: "Quarta-feira",
    THURSDAY: "Quinta-feira",
    FRIDAY: "Sexta-feira",
    SATURDAY: "Sábado",
    SUNDAY: "Domingo",
};

const dayOfWeekShortLabels: Record<string, string> = {
    MONDAY: "Seg",
    TUESDAY: "Ter",
    WEDNESDAY: "Qua",
    THURSDAY: "Qui",
    FRIDAY: "Sex",
    SATURDAY: "Sáb",
    SUNDAY: "Dom",
};

function formatScheduleLabel(schedule: ScheduleOption, variant: "short" | "full" = "short"): string {
    const day =
        variant === "full"
            ? dayOfWeekLabels[schedule.dayOfWeek] || schedule.dayOfWeek
            : dayOfWeekShortLabels[schedule.dayOfWeek] || schedule.dayOfWeek;
    const time = `${schedule.startTime} - ${schedule.endTime}`;
    if (schedule.teacherName) {
        return `${day} · ${time} · ${schedule.teacherName}`;
    }
    return `${day} · ${time}`;
}

export function EditLessonSheet({
    programSlug,
    periodSlug,
    classGroupSlug,
    courseCode,
    schedules,
    lesson,
    children,
    canWrite: canWriteProp,
}: EditLessonSheetProps) {
    const canWriteFromContext = useCanWrite();
    const canWrite = canWriteProp ?? canWriteFromContext;
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Format initial date for input (YYYY-MM-DD)
    const initialDateObj = new Date(lesson.date);
    const initialDateStr = !isNaN(initialDateObj.getTime()) ? initialDateObj.toISOString().split("T")[0] : "";

    const [date, setDate] = useState(initialDateStr);
    const [topic, setTopic] = useState(lesson.topic);
    const [selectedScheduleId, setSelectedScheduleId] = useState(lesson.scheduleId || "none");

    const isNone = selectedScheduleId === "none";
    const selectedSchedule = !isNone ? schedules.find((s) => s.id === selectedScheduleId) : undefined;

    const canSubmit = date.length > 0 && topic.length >= 2 && !isSubmitting && !isDeleting;

    const handleOpenChange = (nextOpen: boolean) => {
        setOpen(nextOpen);
        if (!nextOpen) {
            // Reset to initial state on close
            setDate(initialDateStr);
            setTopic(lesson.topic);
            setSelectedScheduleId(lesson.scheduleId || "none");
        }
    };

    const handleSubmit = async () => {
        if (!canSubmit) return;
        setIsSubmitting(true);

        try {
            const result = lesson.id
                ? await updateLessonAction(
                    programSlug,
                    periodSlug,
                    classGroupSlug,
                    courseCode,
                    {
                        lessonId: lesson.id,
                        date,
                        topic,
                        teacherId: selectedSchedule?.teacherId || "",
                        timeSlotId: selectedSchedule?.timeSlotId || "",
                        scheduleId: selectedSchedule?.id || "",
                    },
                )
                : await createLessonAction(
                    programSlug,
                    periodSlug,
                    classGroupSlug,
                    courseCode,
                    {
                        date,
                        topic,
                        teacherId: selectedSchedule?.teacherId || "",
                        timeSlotId: selectedSchedule?.timeSlotId || "",
                        scheduleId: selectedSchedule?.id || "",
                    },
                );

            if (result.success) {
                toast.success(lesson.id ? "Aula atualizada com sucesso!" : "Aula registrada com sucesso!");
                handleOpenChange(false);
                router.refresh();
            } else {
                toast.error(result.error || "Erro ao processar aula.");
            }
        } catch {
            toast.error("Erro inesperado ao processar aula.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Tem certeza que deseja apagar esta aula e as respectivas chamadas?")) return;

        setIsDeleting(true);
        try {
            const result = await deleteLessonAction(
                programSlug,
                periodSlug,
                classGroupSlug,
                courseCode,
                lesson.id,
            );

            if (result.success) {
                toast.success("Aula excluída com sucesso!");
                handleOpenChange(false);
                router.refresh();
            } else {
                toast.error(result.error || "Erro ao excluir aula.");
            }
        } catch {
            toast.error("Erro inesperado ao excluir aula.");
        } finally {
            setIsDeleting(false);
        }
    };

    if (!canWrite) {
        return null;
    }

    return (
        <Sheet open={open} onOpenChange={handleOpenChange}>
            <SheetTrigger asChild>
                {children}
            </SheetTrigger>
            <SheetContent className="flex h-dvh max-h-dvh w-full max-w-full min-w-0 flex-col gap-0 overflow-hidden border-l-surface-border bg-surface p-0 data-[side=right]:w-full data-[side=right]:max-w-full data-[side=right]:sm:max-w-[50vw]">
                <SheetHeader className="shrink-0 border-b border-surface-border bg-background/50 p-4 backdrop-blur-sm sm:p-6">
                    <div className="min-w-0 space-y-1">
                        <SheetTitle className="flex min-w-0 items-start gap-2 text-lg font-bold sm:text-2xl">
                            <div className="shrink-0 rounded-lg bg-primary/10 p-2">
                                {lesson.id ? <IconEdit className="size-4 text-primary" /> : <IconCalendarEvent className="size-4 text-primary" />}
                            </div>
                            <span className="min-w-0 wrap-break-word leading-tight">
                                {lesson.id ? "Editar Aula" : "Registrar Aula Prevista"}
                            </span>
                        </SheetTitle>
                        <SheetDescription>
                            {lesson.id
                                ? "Altere os dados da aula. O registro de presença e os horários serão atualizados automaticamente."
                                : "Confirme os dados para registrar esta aula na disciplina. Os registros de presença serão criados automaticamente."
                            }
                        </SheetDescription>
                    </div>
                </SheetHeader>

                <ScrollArea className="min-h-0 w-full max-w-full flex-1 overflow-x-hidden">
                    <div className="box-border w-full max-w-full min-w-0 space-y-6 p-4 sm:p-6">
                        {/* Data da Aula */}
                        <div className="min-w-0 space-y-2">
                            <Label htmlFor="edit-lesson-date">Data da Aula *</Label>
                            <Input
                                id="edit-lesson-date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                disabled={isSubmitting || isDeleting}
                                className="h-12 w-full max-w-full min-w-0 rounded-lg bg-background"
                            />
                        </div>

                        {/* Horário (Schedule) */}
                        {schedules.length > 0 && (
                            <div className="min-w-0 space-y-2 overflow-hidden">
                                <Label>Horário da Grade</Label>
                                <Select
                                    value={selectedScheduleId}
                                    onValueChange={setSelectedScheduleId}
                                    disabled={isSubmitting || isDeleting}
                                >
                                    <SelectTrigger
                                        className="h-12 w-full! max-w-full min-w-0 overflow-hidden rounded-lg bg-background **:data-[slot=select-value]:block **:data-[slot=select-value]:min-w-0 **:data-[slot=select-value]:flex-1 **:data-[slot=select-value]:truncate **:data-[slot=select-value]:text-left"
                                    >
                                        <SelectValue placeholder="Selecione um horário (opcional)">
                                            {isNone
                                                ? null
                                                : selectedSchedule
                                                    ? formatScheduleLabel(selectedSchedule, "short")
                                                    : null}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent
                                        position="popper"
                                        align="start"
                                        className="w-(--radix-select-trigger-width) max-w-[calc(100vw-2rem)]"
                                    >
                                        <SelectItem value="none">Nenhum (Aula Avulsa)</SelectItem>
                                        {schedules.map((schedule) => (
                                            <SelectItem
                                                key={schedule.id}
                                                value={schedule.id}
                                                className="whitespace-normal"
                                                title={formatScheduleLabel(schedule, "full")}
                                            >
                                                {formatScheduleLabel(schedule, "full")}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    Vincule esta aula a um horário da grade. Se não vincular, a aula será registrada como avulsa.
                                </p>
                            </div>
                        )}

                        {/* Tópico */}
                        <div className="space-y-2">
                            <Label htmlFor="edit-lesson-topic">Assunto / Tópico *</Label>
                            <Textarea
                                id="edit-lesson-topic"
                                placeholder="Ex: Introdução à Álgebra Linear"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                disabled={isSubmitting || isDeleting}
                                className="rounded-lg min-h-24 resize-none bg-background"
                                maxLength={500}
                            />
                            <p className="text-xs text-muted-foreground text-right">{topic.length}/500</p>
                        </div>
                    </div>
                </ScrollArea>

                <SheetFooter className="shrink-0 border-t border-surface-border bg-background/50 p-4 backdrop-blur-sm sm:p-6">
                    {lesson.id ? (
                        <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={isDeleting || isSubmitting}
                                className="flex h-12 w-full items-center gap-2 sm:w-auto"
                            >
                                {isDeleting ? <IconLoader2 className="size-4 animate-spin" /> : <IconTrash className="size-4" />}
                                Excluir Aula
                            </Button>
                            <div className="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:flex-row">
                                <Button variant="outline" onClick={() => handleOpenChange(false)} className="h-12 w-full sm:w-auto" disabled={isSubmitting || isDeleting}>
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={!canSubmit}
                                    className="flex h-12 w-full items-center gap-2 sm:w-auto"
                                >
                                    {isSubmitting ? <IconLoader2 className="size-5 animate-spin" /> : <IconEdit className="size-5" />}
                                    {isSubmitting ? "Salvando..." : "Salvar Alterações"}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex w-full min-w-0 flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
                            <Button variant="outline" onClick={() => handleOpenChange(false)} className="h-12 w-full sm:w-auto" disabled={isSubmitting || isDeleting}>
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={!canSubmit}
                                className="flex h-12 w-full items-center gap-2 sm:w-auto"
                            >
                                {isSubmitting ? <IconLoader2 className="size-5 animate-spin" /> : <IconCalendarEvent className="size-5" />}
                                {isSubmitting ? "Registrando..." : "Registrar Aula"}
                            </Button>
                        </div>
                    )}
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
