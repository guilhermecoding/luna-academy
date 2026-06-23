"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { LessonListItem } from "@/services/lessons/lessons.service";
import LessonCardList from "./lesson-card-list";
import type { ScheduleOption } from "./edit-lesson-dialog";
import {
    filterMergedLessons,
    getTotalPages,
    mergeAndSortLessons,
    paginateItems,
    type LessonFilter,
    type UpcomingLesson,
} from "@/lib/lesson-schedule-utils";
import { IconFilter } from "@tabler/icons-react";

const PAGE_SIZE = 10;

const FILTER_LABELS: Record<LessonFilter, string> = {
    fechadas: "Fechadas",
    registradas: "Registradas (futuras)",
    "nao-registradas": "Não registradas",
};

interface LessonsFilteredListProps {
    lessons: LessonListItem[];
    upcomingLessons: UpcomingLesson[];
    basePath: string;
    programSlug: string;
    periodSlug: string;
    classGroupSlug: string;
    courseCode: string;
    schedules: ScheduleOption[];
    canWrite: boolean;
    currentFilter?: LessonFilter;
    currentPage: number;
}

export function LessonsFilteredList({
    lessons,
    upcomingLessons,
    basePath,
    programSlug,
    periodSlug,
    classGroupSlug,
    courseCode,
    schedules,
    canWrite,
    currentFilter,
    currentPage,
}: LessonsFilteredListProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const allItems = mergeAndSortLessons(lessons, upcomingLessons);
    const filteredItems = filterMergedLessons(allItems, currentFilter);
    const totalPages = getTotalPages(filteredItems.length, PAGE_SIZE);
    const safePage = Math.min(Math.max(1, currentPage), totalPages);
    const paginatedItems = paginateItems(filteredItems, safePage, PAGE_SIZE);

    const updateParams = (updates: { filter?: LessonFilter | null; page?: number }) => {
        startTransition(() => {
            const params = new URLSearchParams(searchParams.toString());

            if (updates.filter === null || updates.filter === undefined) {
                params.delete("filter");
            } else if (updates.filter) {
                params.set("filter", updates.filter);
            }

            if (updates.page != null) {
                if (updates.page <= 1) {
                    params.delete("page");
                } else {
                    params.set("page", String(updates.page));
                }
            }

            const query = params.toString();
            router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
        });
    };

    const handleFilter = (filter?: LessonFilter) => {
        updateParams({ filter: filter ?? null, page: 1 });
    };

    const counts = {
        all: allItems.length,
        fechadas: filterMergedLessons(allItems, "fechadas").length,
        registradas: filterMergedLessons(allItems, "registradas").length,
        "nao-registradas": filterMergedLessons(allItems, "nao-registradas").length,
    };

    return (
        <div className={`space-y-4 ${isPending ? "opacity-70 pointer-events-none" : ""}`}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="ml-2 flex items-center gap-2">
                    <IconFilter className="size-5 text-muted-foreground" />
                    <Select
                        value={currentFilter ?? "all"}
                        onValueChange={(value) => {
                            handleFilter(value === "all" ? undefined : (value as LessonFilter));
                        }}
                    >
                        <SelectTrigger className="w-full bg-background sm:w-72">
                            <SelectValue placeholder="Filtrar aulas" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas ({counts.all})</SelectItem>
                            {(Object.keys(FILTER_LABELS) as LessonFilter[]).map((key) => (
                                <SelectItem key={key} value={key}>
                                    {FILTER_LABELS[key]} ({counts[key]})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <p className="ml-2 text-sm text-muted-foreground">
                    {filteredItems.length} aula{filteredItems.length !== 1 ? "s" : ""} no filtro
                </p>
            </div>

            <LessonCardList
                lessons={lessons}
                items={paginatedItems}
                basePath={basePath}
                programSlug={programSlug}
                periodSlug={periodSlug}
                classGroupSlug={classGroupSlug}
                courseCode={courseCode}
                schedules={schedules}
                canWrite={canWrite}
                showUpcoming={false}
                variant="flat"
                emptyMessage={
                    currentFilter
                        ? `Nenhuma aula encontrada no filtro "${FILTER_LABELS[currentFilter]}".`
                        : "Nenhuma aula registrada ou prevista."
                }
            />

            {filteredItems.length > PAGE_SIZE && (
                <div className="flex items-center justify-between px-1 pt-2">
                    <p className="text-sm text-muted-foreground">
                        Exibindo {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filteredItems.length)} de {filteredItems.length}
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={safePage <= 1}
                            onClick={() => updateParams({ page: safePage - 1 })}
                        >
                            Anterior
                        </Button>
                        <span className="text-sm text-muted-foreground min-w-24 text-center">
                            Página {safePage} de {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={safePage >= totalPages}
                            onClick={() => updateParams({ page: safePage + 1 })}
                        >
                            Próxima
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
