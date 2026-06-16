import type { SystemRole } from "@/generated/prisma/enums";

export interface SessionUser {
    id?: string;
    name?: string;
    isAdmin?: boolean;
    isTeacher?: boolean;
    isActive?: boolean;
    systemRole?: SystemRole;
}