"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { IconCheck, IconCalendarPlus, IconCalendarEvent } from "@tabler/icons-react";
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
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-1 p-0.5 bg-muted/50 rounded-full border border-surface-border w-fit">
                    <Button
                        variant={!currentFilter ? "default" : "ghost"}
                        size="sm"
                        onClick={() => handleFilter()}
                        className="rounded-full text-xs px-3"
                    >
                        Todas ({counts.all})
                    </Button>
                    {(Object.keys(FILTER_LABELS) as LessonFilter[]).map((key) => (
                        <Button
                            key={key}
                            variant={currentFilter === key ? "default" : "ghost"}
                            size="sm"
                            onClick={() => handleFilter(key)}
                            className="rounded-full text-xs px-3"
                        >
                            {key === "fechadas" && <IconCheck className="size-3 mr-1" />}
                            {key === "registradas" && <IconCalendarEvent className="size-3 mr-1" />}
                            {key === "nao-registradas" && <IconCalendarPlus className="size-3 mr-1" />}
                            {FILTER_LABELS[key]} ({counts[key]})
                        </Button>
                    ))}
                </div>

                <p className="text-sm text-muted-foreground">
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
