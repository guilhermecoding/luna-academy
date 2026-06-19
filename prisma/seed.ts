import "dotenv/config";
import { auth } from "../src/lib/auth";
import prisma from "../src/lib/prisma";

const REQUIRED_ADMIN_ENV = [
    "ADMIN_NAME",
    "ADMIN_EMAIL",
    "ADMIN_PASSWORD",
    "ADMIN_CPF",
    "ADMIN_PHONE",
    "ADMIN_BIRTH_DATE",
    "ADMIN_BIO",
    "ADMIN_LUNA_ID",
] as const;

type AdminEnv = Record<(typeof REQUIRED_ADMIN_ENV)[number], string>;

function getAdminEnv(): AdminEnv {
    const missing = REQUIRED_ADMIN_ENV.filter((key) => !process.env[key]?.trim());

    if (missing.length > 0) {
        throw new Error(`[seed] Variáveis de ambiente obrigatórias ausentes: ${missing.join(", ")}`);
    }

    const env = Object.fromEntries(
        REQUIRED_ADMIN_ENV.map((key) => [key, process.env[key]!.trim()]),
    ) as AdminEnv;

    const birthDate = new Date(env.ADMIN_BIRTH_DATE);
    if (Number.isNaN(birthDate.getTime())) {
        throw new Error("[seed] ADMIN_BIRTH_DATE inválida. Use o formato YYYY-MM-DD.");
    }

    return env;
}

async function seedAdmin() {
    const env = getAdminEnv();

    const existingUser = await prisma.user.findUnique({
        where: { email: env.ADMIN_EMAIL },
        select: { id: true },
    });

    if (existingUser) {
        console.info(`[seed] Admin já existe para o email ${env.ADMIN_EMAIL}.`);
        return;
    }

    const signUpBody = {
        name: env.ADMIN_NAME,
        email: env.ADMIN_EMAIL,
        password: env.ADMIN_PASSWORD,
        cpf: env.ADMIN_CPF,
        phone: env.ADMIN_PHONE,
        birthDate: new Date(env.ADMIN_BIRTH_DATE),
        bio: env.ADMIN_BIO,
        systemRole: "FULL_ACCESS",
        isAdmin: true,
        isTeacher: false,
        isActive: true,
        genre: "PREFER_NOT_TO_SAY",
        lunaId: env.ADMIN_LUNA_ID,
    };

    await auth.api.signUpEmail({
        body: signUpBody,
    });

    console.info(`[seed] Admin inicial criado com sucesso: ${env.ADMIN_EMAIL}`);
}

seedAdmin()
    .catch((error) => {
        console.error("[seed] Erro ao executar seed de admin:", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
