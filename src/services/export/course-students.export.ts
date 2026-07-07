import { serializeCsv, escapeCsvValue } from "@/lib/export/csv";
import { aggregateCourseTeachers } from "@/lib/schedule-teacher-utils";
import prisma from "@/lib/prisma";
import {
    STUDENTS_EXPORT_COLUMNS,
    type StudentExportRow,
} from "@/services/export/students-export.config";
import type { CourseWithRelations } from "@/services/courses/courses.type";

export type CourseTeachersExport = {
    titular: string | null;
    assistants: string[];
};

export type CourseStudentsExportMeta = {
    courseId: string;
    courseName: string;
    classGroupName: string;
    periodName: string;
    programName: string;
    teachers: CourseTeachersExport;
};

export function getCourseTeachersForExport(
    schedules: CourseWithRelations["schedules"],
): CourseTeachersExport {
    const { titulares, assistants } = aggregateCourseTeachers(schedules);

    return {
        titular: titulares.length > 0 ? titulares.map((t) => t.name).join("; ") : null,
        assistants: assistants.map((assistant) => assistant.name),
    };
}

export async function getStudentsByCourseForExport(courseId: string): Promise<StudentExportRow[]> {
    return prisma.student.findMany({
        where: {
            enrollments: {
                some: {
                    courseId,
                },
            },
        },
        select: {
            name: true,
            lunaId: true,
            cpf: true,
            studentPhone: true,
            email: true,
            birthDate: true,
        },
        orderBy: {
            name: "asc",
        },
    });
}

export async function buildCourseStudentsCsv(meta: CourseStudentsExportMeta): Promise<string> {
    const rows = await getStudentsByCourseForExport(meta.courseId);
    const delimiter = ",";

    const titularValue = meta.teachers.titular ?? "—";
    const assistantsValue = meta.teachers.assistants.length > 0
        ? meta.teachers.assistants.join("; ")
        : "—";

    const preamble = [
        `Professor Titular,${escapeCsvValue(titularValue, delimiter)}`,
        `Assistentes,${escapeCsvValue(assistantsValue, delimiter)}`,
        "",
    ].join("\n");

    return `${preamble}${serializeCsv(rows, STUDENTS_EXPORT_COLUMNS)}`;
}

export async function loadCourseStudentsExportData(
    course: CourseWithRelations,
    classGroupName: string,
    programName: string,
): Promise<{
    rows: StudentExportRow[];
    meta: CourseStudentsExportMeta;
}> {
    const teachers = getCourseTeachersForExport(course.schedules);
    const rows = await getStudentsByCourseForExport(course.id);

    return {
        rows,
        meta: {
            courseId: course.id,
            courseName: course.name,
            classGroupName,
            periodName: course.period.name,
            programName,
            teachers,
        },
    };
}
