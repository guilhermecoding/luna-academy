"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useForm, type SubmitHandler, useWatch, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { classGroupSchema, shiftLabels, type ClassGroupInput } from "../../schema";
import { IconLoader2, IconArrowsShuffle, IconSun, IconSunset2, IconMoon, IconBooks } from "@tabler/icons-react";
import autoSlug from "@/lib/auto-slug";
import { createClassAction } from "../actions";

type DegreeData = {
    id: string;
    name: string;
    slug: string;
};

type SubjectData = {
    id: string;
    name: string;
    code: string;
    degreeId: string;
};

interface CreateClassFormProps {
    programSlug: string;
    periodSlug: string;
    degrees: DegreeData[];
    subjects: SubjectData[];
}

const shiftIcons = {
    MORNING: IconSunset2,
    AFTERNOON: IconSun,
    EVENING: IconMoon,
} as const;

export function CreateClassForm({
    programSlug,
    periodSlug,
    degrees,
    subjects,
}: CreateClassFormProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const form = useForm<ClassGroupInput>({
        resolver: zodResolver(classGroupSchema) as Resolver<ClassGroupInput>,
        mode: "onChange",
        defaultValues: {
            name: "",
            slug: "",
            degreeId: "",
            shift: undefined,
            groupLink: "",
            subjectIds: [],
        },
    });

    const {
        register,
        control,
        formState: { errors, isSubmitting, isValid, isDirty },
        setValue,
        setError,
        clearErrors,
        reset,
    } = form;

    const nameValue = useWatch({ control, name: "name" });
    const slugValue = useWatch({ control, name: "slug" });
    const degreeIdValue = useWatch({ control, name: "degreeId" });
    const subjectIdsValue = useWatch({ control, name: "subjectIds" }) ?? [];

    const canSubmit =
        isValid && isDirty && !isSubmitting && Boolean(nameValue?.trim()) && Boolean(slugValue?.trim());

    const degreeSubjects = useMemo(() => {
        if (!degreeIdValue) return [];
        return subjects.filter((s) => s.degreeId === degreeIdValue);
    }, [degreeIdValue, subjects]);

    useEffect(() => {
        clearErrors();
        reset();
    }, [clearErrors, reset]);

    useEffect(() => {
        setValue("subjectIds", [], { shouldValidate: false, shouldDirty: false });
    }, [degreeIdValue, setValue]);

    const toggleSubject = (subjectId: string, checked: boolean) => {
        const next = checked
            ? [...subjectIdsValue, subjectId]
            : subjectIdsValue.filter((id) => id !== subjectId);
        setValue("subjectIds", next, { shouldDirty: true, shouldValidate: true });
    };

    const toggleAll = (checked: boolean) => {
        setValue(
            "subjectIds",
            checked ? degreeSubjects.map((s) => s.id) : [],
            { shouldDirty: true, shouldValidate: true },
        );
    };

    const allSelected =
        degreeSubjects.length > 0 && degreeSubjects.every((s) => subjectIdsValue.includes(s.id));

    const onSubmit: SubmitHandler<ClassGroupInput> = async (data) => {
        clearErrors("root");

        try {
            const result = await createClassAction(programSlug, periodSlug, data);

            if (result?.success === false) {
                const params = new URLSearchParams(searchParams.toString());
                params.set("toast", "error");
                params.set("message", result.error || "Erro ao criar classe");
                router.replace(`${pathname}?${params.toString()}`, { scroll: false });

                setError("root", {
                    type: "server",
                    message: result.error || "Erro ao criar classe",
                });
                return;
            }

            if (result?.success && result.redirectTo) {
                router.push(result.redirectTo);
                router.refresh();
                return;
            }
        } catch {
            const params = new URLSearchParams(searchParams.toString());
            params.set("toast", "error");
            params.set("message", "Erro fatal ao criar classe");
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });

            setError("root", {
                type: "server",
                message: "Erro fatal ao criar classe",
            });
        }
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {errors.root?.message && (
                <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-red-900 dark:text-red-200 text-sm">
                    {errors.root.message}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="name">Nome da Classe *</Label>
                    <Input
                        id="name"
                        placeholder="Ex: 1º Ano A, 2ª Série B"
                        {...register("name")}
                        disabled={isSubmitting}
                        aria-invalid={errors.name ? "true" : "false"}
                        className="p-5 rounded-lg bg-background"
                    />
                    {errors.name && (
                        <p className="text-sm text-red-600">{errors.name.message}</p>
                    )}
                </div>

                <div className="space-y-2 col-span-1">
                    <Label htmlFor="slug">Código da Classe *</Label>
                    <div className="flex gap-2">
                        <Input
                            id="slug"
                            placeholder="Ex: 1-ANO-A"
                            {...register("slug", {
                                onChange: (e) => {
                                    setValue("slug", e.target.value.toUpperCase(), {
                                        shouldValidate: true,
                                    });
                                },
                            })}
                            disabled={isSubmitting}
                            aria-invalid={errors.slug ? "true" : "false"}
                            className="p-5 rounded-lg bg-background flex-1 uppercase"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            className="px-4 py-1.5 bg-muted mt-0.5 hover:bg-muted/80 text-foreground border-surface-border"
                            onClick={() => {
                                const newSlug = autoSlug(nameValue)?.toUpperCase();
                                if (newSlug) {
                                    setValue("slug", newSlug, {
                                        shouldDirty: true,
                                        shouldTouch: true,
                                        shouldValidate: true,
                                    });
                                }
                            }}
                            title="Gerar código a partir do nome"
                        >
                            <IconArrowsShuffle className="size-5" />
                        </Button>
                    </div>
                    {errors.slug && (
                        <p className="text-sm text-red-600">{errors.slug.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="degreeId">Matriz Curricular *</Label>
                    {degrees.length === 0 ? (
                        <div className="p-4 border-2 border-dashed border-surface-border rounded-xl bg-surface/30 text-center">
                            <p className="text-sm text-muted-foreground">
                                Nenhuma Matriz cadastrada para este programa. <br /> Comece criando a primeira.
                            </p>
                        </div>
                    ) : (
                        <Controller
                            control={control}
                            name="degreeId"
                            render={({ field }) => (
                                <Select
                                    value={field.value || ""}
                                    onValueChange={field.onChange}
                                    disabled={isSubmitting}
                                >
                                    <SelectTrigger
                                        id="degreeId"
                                        className="p-5 rounded-lg bg-background w-full"
                                    >
                                        <SelectValue placeholder="Selecione a matriz" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {degrees.map((d) => (
                                            <SelectItem key={d.id} value={d.id}>
                                                {d.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    )}
                    {errors.degreeId && (
                        <p className="text-sm text-red-600">{errors.degreeId.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="shift">Turno *</Label>
                    <Controller
                        control={control}
                        name="shift"
                        render={({ field }) => (
                            <Select
                                value={field.value}
                                onValueChange={field.onChange}
                                disabled={isSubmitting}
                            >
                                <SelectTrigger
                                    id="shift"
                                    className="p-5 rounded-lg bg-background w-full"
                                >
                                    <SelectValue placeholder="Selecione o turno" />
                                </SelectTrigger>
                                <SelectContent>
                                    {(Object.entries(shiftLabels) as [keyof typeof shiftLabels, string][]).map(
                                        ([value, label]) => {
                                            const Icon = shiftIcons[value];
                                            return (
                                                <SelectItem key={value} value={value}>
                                                    <span className="flex items-center gap-2">
                                                        <Icon className="size-4 text-muted-foreground" />
                                                        {label}
                                                    </span>
                                                </SelectItem>
                                            );
                                        },
                                    )}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.shift && (
                        <p className="text-sm text-red-600">{errors.shift.message}</p>
                    )}
                </div>

                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="groupLink">Link para grupo de comunicação</Label>
                    <Input
                        id="groupLink"
                        placeholder="Ex: https://chat.whatsapp.com/..."
                        {...register("groupLink")}
                        disabled={isSubmitting}
                        aria-invalid={errors.groupLink ? "true" : "false"}
                        className="p-5 rounded-lg bg-background"
                    />
                    {errors.groupLink && (
                        <p className="text-sm text-red-600">{errors.groupLink.message}</p>
                    )}
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <IconBooks className="size-5 text-muted-foreground" />
                        <Label>Disciplinas da matriz *</Label>
                    </div>
                    {degreeSubjects.length > 0 && (
                        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                            <Checkbox
                                checked={allSelected}
                                onChange={(e) => toggleAll(e.target.checked)}
                                disabled={isSubmitting}
                            />
                            Selecionar todas
                        </label>
                    )}
                </div>

                {!degreeIdValue ? (
                    <div className="p-4 border-2 border-dashed border-surface-border rounded-xl bg-surface/30 text-center">
                        <p className="text-sm text-muted-foreground">
                            Selecione uma Matriz para listar as disciplinas.
                        </p>
                    </div>
                ) : degreeSubjects.length === 0 ? (
                    <div className="p-4 border-2 border-dashed border-surface-border rounded-xl bg-surface/30 text-center">
                        <p className="text-sm text-muted-foreground">
                            Nenhuma disciplina cadastrada nesta Matriz.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4 border border-surface-border rounded-xl bg-background">
                        {degreeSubjects.map((subject) => {
                            const checked = subjectIdsValue.includes(subject.id);
                            return (
                                <label
                                    key={subject.id}
                                    className="flex items-start gap-3 rounded-lg border border-surface-border/60 px-3 py-2.5 cursor-pointer hover:bg-muted/40 transition-colors"
                                >
                                    <Checkbox
                                        className="mt-0.5"
                                        checked={checked}
                                        onChange={(e) => toggleSubject(subject.id, e.target.checked)}
                                        disabled={isSubmitting}
                                    />
                                    <span className="min-w-0">
                                        <span className="block text-sm font-medium leading-tight">
                                            {subject.name}
                                        </span>
                                        <span className="block text-xs text-muted-foreground font-mono mt-0.5">
                                            {subject.code}
                                        </span>
                                    </span>
                                </label>
                            );
                        })}
                    </div>
                )}
                {errors.subjectIds && (
                    <p className="text-sm text-red-600">{errors.subjectIds.message}</p>
                )}
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-4 border-t items-center mt-6">
                <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                >
                    Cancelar
                </Button>
                <Button className="flex items-center gap-2 w-full sm:w-auto" type="submit" disabled={!canSubmit}>
                    {isSubmitting && <IconLoader2 className="size-5 animate-spin" />}
                    {isSubmitting ? "Criando..." : "Criar Classe"}
                </Button>
            </div>
        </form>
    );
}
