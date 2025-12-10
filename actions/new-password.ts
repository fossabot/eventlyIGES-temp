"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { NewPasswordSchema } from "@/schemas";
import { getPasswordResetTokenByToken } from "@/data/reset-password-token";
import { getUserByEmail } from "@/data/user";

export const newPassword = async (
    values: z.infer<typeof NewPasswordSchema>,
    token: string | null

) => {

    if(!token) {
        return { error: "Token non valido" }
    }
   
    const validatedFields = await NewPasswordSchema.safeParseAsync(values);
    if (!validatedFields.success) {
        return { error: "Campi non validi" };
    }

    const { password } = validatedFields.data;

    const existingToken = await getPasswordResetTokenByToken(token);

    if (!existingToken) {
        return { error: "Token non valido" };
    }

    const hasExpired = new Date(existingToken.expires) < new Date();

    if (hasExpired) {
        return { error: "Token scaduto" };
    }

    const existingUser = await getUserByEmail(existingToken.email);

    if (!existingUser) {
        return { error: "Utente non trovato" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.user.update({
        where: {
            id: existingUser.id
        },
        data: {
            password: hashedPassword
        }       
    })

    await db.passwordResetToken.delete({
        where: {
            id: existingToken.id
        }
    })

    return { success: "Password cambiata con successo" };
};