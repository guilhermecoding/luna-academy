"use server";

import { requireAdmin, requireAdminWrite } from "@/lib/auth-guards";
import { updateTag } from "next/cache";
import { createStudentSchema, editStudentSchema, importStudentRowSchema, type CreateStudentData, type EditStudentData } from "./schema";
import { createStudent, updateStudent } from "@/services/students/students.service";
import { Genre, Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";

export async function createStudentAction(data: CreateStudentData, periodId?: string, redirectPath: string = "/admin/alunos") {
    const authResult = await requireAdminWrite();
    if (!authResult.ok) return { success: false, error: authResult.error };

    try {
        const parsedData = createStudentSchema.parse(data);

        await createStudent({
            name: parsedData.name,
            email: parsedData.email,
            cpf: parsedData.cpf,
            studentPhone: parsedData.studentPhone,
            parentPhone: parsedData.parentPhone || null,
            birthDate: parsedData.birthDate,
            genre: parsedData.genre,
            originSchool: parsedData.originSchool || null,
        }, periodId);

        updateTag("students-list");
        updateTag("students-count");
        updateTag("students-indicators");
        if (periodId) {
            updateTag(`period:${periodId}:students-list`);
            updateTag(`period:${periodId}:students-count`);
        }

    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                const target = (error.meta?.target as string[]) || [];

                if (target.includes("cpf")) {
                    return { success: false, error: "Este CPF já está em uso por outro aluno." };
                }
                if (target.includes("email")) {
                    return { success: false, error: "Este e-mail já está em uso por outro aluno." };
                }
                if (target.includes("luna_id") || target.includes("lunaId")) {
                    return { success: false, error: "Esta Matrícula (LUNA ID) já está em uso." };
                }
                
                return { success: false, error: "Conflito de dados: Um aluno com estes dados já existe." };
            }
        }
        console.error("Erro ao criar aluno:", error);
        return { success: false, error: "Ocorreu um erro inesperado ao criar o aluno." };
    }
    if (redirectPath !== "none") {
        return { success: true, redirectTo: redirectPath };
    }

    return { success: true };
}

export async function editStudentAction(id: string, data: EditStudentData) {
    const authResult = await requireAdminWrite();
    if (!authResult.ok) return { success: false, error: authResult.error };

    try {
        const parsedData = editStudentSchema.parse(data);

        await updateStudent(id, {
            name: parsedData.name,
            email: parsedData.email,
            cpf: parsedData.cpf,
            studentPhone: parsedData.studentPhone,
            parentPhone: parsedData.parentPhone || null,
            birthDate: parsedData.birthDate,
            genre: parsedData.genre,
            originSchool: parsedData.originSchool || null,
        });

        updateTag("students-list");
        updateTag("students-indicators");
        updateTag(`student-${id}`);

    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                const target = (error.meta?.target as string[]) || [];

                if (target.includes("cpf")) {
                    return { success: false, error: "Este CPF já está em uso por outro aluno." };
                }
                if (target.includes("email")) {
                    return { success: false, error: "Este e-mail já está em uso por outro aluno." };
                }
                if (target.includes("luna_id") || target.includes("lunaId")) {
                    return { success: false, error: "Esta Matrícula (LUNA ID) já está em uso." };
                }

                return { success: false, error: "Conflito de dados: Outro aluno já possui estas informações." };
            }
        }
        console.error("Erro ao editar aluno:", error);
        return { success: false, error: "Ocorreu um erro inesperado ao atualizar o aluno." };
    }

    return { success: true, redirectTo: "/admin/alunos" };
}

export async function deleteStudentAction(studentId: string, adminPasswordConfirm: string) {
    const authResult = await requireAdminWrite();
    if (!authResult.ok) return { success: false, error: authResult.error };

    try {
        const actorId = authResult.session.user.id;

        // Verify password
        const adminAccount = await prisma.account.findFirst({
            where: { userId: actorId, providerId: "credential" },
        });

        if (!adminAccount?.password) {
            return { success: false, error: "Não foi possível verificar a senha do administrador." };
        }

        const { verifyPassword } = await import("better-auth/crypto");
        const isPasswordValid = await verifyPassword({
            hash: adminAccount.password,
            password: adminPasswordConfirm,
        });

        if (!isPasswordValid) {
            return { success: false, error: "Senha incorreta." };
        }

        const { deleteStudent } = await import("@/services/students/students.service");
        await deleteStudent(studentId);

        updateTag("students-list");
        updateTag("students-count");
        updateTag("students-indicators");
        updateTag(`student-${studentId}`);

        return { success: true };
    } catch (error) {
        console.error("Erro fatal ao excluir aluno:", error);
        return { success: false, error: "Erro fatal ao excluir aluno." };
    }
}

export type ImportResult = {
    success: true;
    created: number;
    updated: number;
    total: number;
    skipped: { row: number; errors: string[] }[];
    dbErrors: { row: number; cpf: string; error: string }[];
} | {
    success: false;
    error: string;
};

export async function importStudentsAction(formData: FormData): Promise<ImportResult> {
    const authResult = await requireAdminWrite();
    if (!authResult.ok) return { success: false, error: authResult.error };

    try {
        const file = formData.get("file") as File | null;
        if (!file) {
            return { success: false, error: "Nenhum arquivo enviado." };
        }

        if (!file.name.endsWith(".csv")) {
            return { success: false, error: "Formato inválido. Envie um arquivo .csv." };
        }

        const content = await file.text();
        const { parseCsv, parseDateString, parseGenre } = await import("@/lib/csv-helper");
        const rows = parseCsv(content);

        if (rows.length === 0) {
            return { success: false, error: "O arquivo CSV está vazio ou não possui dados válidos." };
        }

        if (rows.length > 1000) {
            return { success: false, error: "O arquivo excede o limite de 1000 alunos por importação." };
        }

        // Validar e transformar cada linha
        type BulkStudentInput = {
            name: string;
            email: string;
            cpf: string;
            birthDate: Date;
            genre: Genre;
            studentPhone: string;
            parentPhone?: string | null;
            originSchool?: string | null;
        };
        const validStudents: BulkStudentInput[] = [];
        const skipped: { row: number; errors: string[] }[] = [];

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const rowNumber = i + 2; // +2 pois linha 1 é o cabeçalho e o array é 0-indexed

            // Limpar CPF e telefones (remover formatação)
            const cleanCpf = (row.cpf || "").replace(/\D/g, "");
            const cleanPhone = (row.celular_aluno || "").replace(/\D/g, "");
            const cleanParentPhone = (row.celular_responsavel || "").replace(/\D/g, "");

            const parsed = importStudentRowSchema.safeParse({
                nome: row.nome || row.name || "",
                email: row.email || row.e_mail || "",
                cpf: cleanCpf,
                data_nascimento: row.data_nascimento || row.data_de_nascimento || row.nascimento || "",
                genero: row.genero || row.sexo || "",
                celular_aluno: cleanPhone,
                celular_responsavel: cleanParentPhone,
                escola_origem: row.escola_origem || row.escola || "",
            });

            if (!parsed.success) {
                skipped.push({
                    row: rowNumber,
                    errors: parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`),
                });
                continue;
            }

            const birthDate = parseDateString(parsed.data.data_nascimento);
            if (!birthDate) {
                skipped.push({
                    row: rowNumber,
                    errors: [`Data de nascimento inválida: "${parsed.data.data_nascimento}". Use DD/MM/YYYY ou YYYY-MM-DD.`],
                });
                continue;
            }

            validStudents.push({
                name: parsed.data.nome,
                email: parsed.data.email,
                cpf: parsed.data.cpf,
                birthDate,
                genre: parseGenre(parsed.data.genero),
                studentPhone: parsed.data.celular_aluno,
                parentPhone: parsed.data.celular_responsavel || null,
                originSchool: parsed.data.escola_origem || null,
            });
        }

        if (validStudents.length === 0) {
            return { success: false, error: "Nenhuma linha válida encontrada no CSV." };
        }

        const periodId = formData.get("periodId") as string | null;

        // Executar o bulk upsert
        const { bulkUpsertStudents } = await import("@/services/students/students.service");
        const result = await bulkUpsertStudents(validStudents, periodId || undefined);

        updateTag("students-list");
        updateTag("students-count");
        updateTag("students-indicators");
        if (periodId) {
            updateTag(`period:${periodId}:students-list`);
            updateTag(`period:${periodId}:students-count`);
        }

        return {
            success: true,
            created: result.created,
            updated: result.updated,
            total: result.total,
            skipped,
            dbErrors: result.errors,
        };
    } catch (error) {
        console.error("Erro na importação em massa:", error);
        return { success: false, error: "Erro inesperado durante a importação." };
    }
}

export async function unlinkStudentsFromPeriodAction(studentIds: string[], periodId: string, adminPasswordConfirm: string) {
    const authResult = await requireAdminWrite();
    if (!authResult.ok) return { success: false, error: authResult.error };

    try {
        const actorId = authResult.session.user.id;

        if (studentIds.length === 0) {
            return { success: false, error: "Nenhum aluno selecionado" };
        }

        // Verificar senha
        const adminAccount = await prisma.account.findFirst({
            where: { userId: actorId, providerId: "credential" },
        });

        if (!adminAccount?.password) {
            return { success: false, error: "Não foi possível verificar a senha do administrador." };
        }

        const { verifyPassword } = await import("better-auth/crypto");
        const isPasswordValid = await verifyPassword({
            hash: adminAccount.password,
            password: adminPasswordConfirm,
        });

        if (!isPasswordValid) {
            return { success: false, error: "Senha incorreta." };
        }

        const { unlinkStudentsFromPeriod } = await import("@/services/students/students.service");
        await unlinkStudentsFromPeriod(studentIds, periodId);

        updateTag(`period:${periodId}:students-list`);
        updateTag(`period:${periodId}:students-count`);
        updateTag(`period:${periodId}:class-groups`);
        updateTag(`period:${periodId}`);
        updateTag(`program:${periodId}:periods`);

        return { success: true };
    } catch (error) {
        console.error("Erro ao desvincular alunos:", error);
        return { success: false, error: "Erro inesperado ao desvincular alunos." };
    }
}

export async function enrollStudentsInClassGroupAction(studentIds: string[], classGroupId: string, periodId: string) {
    const authResult = await requireAdminWrite();
    if (!authResult.ok) return { success: false, error: authResult.error };

    try {
        if (studentIds.length === 0) {
            return { success: false, error: "Nenhum aluno selecionado" };
        }

        const { enrollStudentsInClassGroup } = await import("@/services/class-groups/class-groups.service");
        const result = await enrollStudentsInClassGroup(classGroupId, studentIds);

        updateTag(`period:${periodId}:students-list`);
        updateTag(`period:${periodId}:students-count`);
        updateTag(`period:${periodId}:available-students`);
        updateTag(`period:${periodId}:class-groups`);
        updateTag(`class-group:${classGroupId}:students-list`);
        updateTag(`class-group:${classGroupId}:students-count`);

        for (const lessonId of result.affectedLessonIds) {
            updateTag(`lesson:${lessonId}:attendances`);
        }
        for (const courseId of result.courseIds) {
            updateTag(`course:${courseId}:lessons`);
        }

        return { success: true };
    } catch (error) {
        console.error("Erro ao enturmar alunos:", error);
        return { success: false, error: "Erro inesperado ao enturmar alunos." };
    }
}

export async function unlinkStudentsFromClassGroupAction(studentIds: string[], classGroupId: string, periodId: string, adminPasswordConfirm: string) {
    const authResult = await requireAdminWrite();
    if (!authResult.ok) return { success: false, error: authResult.error };

    try {
        const actorId = authResult.session.user.id;

        if (studentIds.length === 0) {
            return { success: false, error: "Nenhum aluno selecionado" };
        }

        // Verificar senha
        const adminAccount = await prisma.account.findFirst({
            where: { userId: actorId, providerId: "credential" },
        });

        if (!adminAccount?.password) {
            return { success: false, error: "Não foi possível verificar a senha do administrador." };
        }

        const { verifyPassword } = await import("better-auth/crypto");
        const isPasswordValid = await verifyPassword({
            hash: adminAccount.password,
            password: adminPasswordConfirm,
        });

        if (!isPasswordValid) {
            return { success: false, error: "Senha incorreta." };
        }

        const { unlinkStudentsFromClassGroup } = await import("@/services/class-groups/class-groups.service");
        const { getLessonIdsByCourseIds } = await import("@/services/lessons/lessons.service");
        const result = await unlinkStudentsFromClassGroup(classGroupId, studentIds);

        updateTag(`period:${periodId}:students-list`);
        updateTag(`period:${periodId}:students-count`);
        updateTag(`period:${periodId}:available-students`);
        updateTag(`period:${periodId}:class-groups`);
        updateTag(`class-group:${classGroupId}:students-list`);
        updateTag(`class-group:${classGroupId}:students-count`);

        const lessonIds = await getLessonIdsByCourseIds(result.courseIds);
        for (const lessonId of lessonIds) {
            updateTag(`lesson:${lessonId}:attendances`);
        }

        return { success: true };
    } catch (error) {
        console.error("Erro ao desvincular alunos da turma:", error);
        return { success: false, error: "Erro inesperado ao desvincular alunos da turma." };
    }
}

export async function getAvailableStudentsAction(periodId: string, classGroupId: string, query?: string, page: number = 1, limit: number = 20) {
    const authResult = await requireAdmin();
    if (!authResult.ok) return { success: false, error: authResult.error };

    try {
        const { getAvailableStudentsForClassGroup } = await import("@/services/students/students.service");
        const { students, total } = await getAvailableStudentsForClassGroup(periodId, classGroupId, query, page, limit);

        return { 
            success: true, 
            students, 
            total,
            totalPages: Math.ceil(total / limit),
        };
    } catch (error) {
        console.error("Erro ao buscar alunos disponíveis:", error);
        return { success: false, error: "Erro inesperado ao buscar alunos." };
    }
}

export async function findStudentsByListAction(identifiers: string[], periodId: string) {
    const authResult = await requireAdmin();
    if (!authResult.ok) return { success: false, error: authResult.error };

    try {
        const cleanedIdentifiers = identifiers
            .map(id => id.trim())
            .filter(id => id.length > 0);

        if (cleanedIdentifiers.length === 0) return { success: true, students: [] };

        const students = await prisma.student.findMany({
            where: {
                OR: [
                    { lunaId: { in: cleanedIdentifiers } },
                    { cpf: { in: cleanedIdentifiers.map(id => id.replace(/\D/g, "")) } },
                ],
                studentPeriods: {
                    some: { periodId },
                },
            },
            select: {
                id: true,
                name: true,
                lunaId: true,
                cpf: true,
            },
        });

        const foundLunaIds = new Set(students.map(s => s.lunaId));
        const foundCpfs = new Set(students.map(s => s.cpf));
        
        const notFound = cleanedIdentifiers.filter(id => {
            const clean = id.replace(/\D/g, "");
            return !foundLunaIds.has(id) && !foundCpfs.has(clean);
        });

        return { success: true, students, notFound };
    } catch (error) {
        console.error("Erro ao buscar lista de alunos:", error);
        return { success: false, error: "Erro ao processar lista." };
    }
}

