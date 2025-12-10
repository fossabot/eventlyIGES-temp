"use server";

import { db } from "@/lib/db";
import { getVerificationTokenByToken } from "@/data/verification-token";
import { getUserByEmail } from "@/data/user";

export const newVerification = async (token: string) => {
    const existingToken = await getVerificationTokenByToken(token);
    if (!existingToken) {
        return { error: "Token non valido" }
    }

    const hasExpired = new Date(existingToken.expires) < new Date();

    if (hasExpired) {
        return { error: "Token scaduto" }
    }

    const existingUser = await getUserByEmail(existingToken.email);

    if (!existingUser) {
        return { error: "Utente non trovato" }
    }

    await db.user.update({
        where: {
            id: existingUser.id
        },
        data: {
            emailVerified: new Date(),
            email: existingToken.email  // quando l'utente vorrà cambiare email
        }
    })

    await db.verificationToken.delete({
        where: {
            id: existingToken.id
        }
    })

    return { success: "Email verificata !" };
}