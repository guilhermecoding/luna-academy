import prisma from "@/lib/prisma";

export async function isGoogleAccountLinked(userId: string): Promise<boolean> {
    const account = await prisma.account.findFirst({
        where: {
            userId,
            providerId: "google",
        },
        select: { id: true },
    });

    return account !== null;
}
