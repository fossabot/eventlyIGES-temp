"use server";

import { getUserByEmail } from "@/data/user";
import { generatePasswordResetToken } from "@/lib/tokens";
import { ResetSchema } from "@/schemas";
import { sendResetPasswordEmail } from "@/lib/mail";

import * as z from "zod";

export const reset = async (values: z.infer<typeof ResetSchema>) => {
    const validatedFields = await ResetSchema.safeParseAsync(values);

    if(!validatedFields.success) {
        return { error: "Email non valida" };
    }

    const {email} = validatedFields.data;

    const existingUser = await getUserByEmail(email);

    if(!existingUser) {
        return { error: "Utente non trovato" };
    }

    const getPasswordResetToken = await generatePasswordResetToken(email);

    await sendResetPasswordEmail(getPasswordResetToken.email, getPasswordResetToken.token);

    return { success: "Email di recupero inviata!" };

}
