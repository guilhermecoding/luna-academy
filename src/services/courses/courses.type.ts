import { Prisma } from "@/generated/prisma/client";

const scheduleInclude = {
    timeSlot: true,
    teacher: {
        select: {
            id: true,
            name: true,
            isActive: true,
        },
    },
    assistants: {
        select: {
            assistantId: true,
            assistant: {
                select: {
                    id: true,
                    name: true,
                    isActive: true,
                },
            },
        },
    },
    room: {
        include: {
            campus: true,
        },
    },
} satisfies Prisma.ScheduleInclude;

export type CourseWithRelations = Prisma.CourseGetPayload<{
    include: {
        subject: true;
        room: {
            include: {
                campus: true;
            };
        };
        period: true;
        schedules: {
            include: typeof scheduleInclude;
        };
    };
}>;

export { scheduleInclude };
