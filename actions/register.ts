"use server"

import { RegisterSchema } from "@/schemas"
import { z } from "zod"

import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { getUserByEmail } from "@/data/user";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";


export const register = async (values:z.infer<typeof RegisterSchema>) => {
    const validatedFields = await RegisterSchema.safeParseAsync(values);

    if (!validatedFields.success) {
        return { error: "Campi non validi" };
    }

    const {email, password, name, privacyPolicy, termsAndConditions} = validatedFields.data;
    
    // Verifica che l'utente abbia accettato la privacy policy e i termini e condizioni
    if (!privacyPolicy || !termsAndConditions) {
        return { error: "Devi accettare la Privacy Policy e i Termini e Condizioni" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    //CONTROLLO EMAIL GIA' IN USO
    const existingUser = await getUserByEmail(email);

    if (existingUser) {
        return { error: "Email già in uso" };
    }

    await db.user.create({
        data: {
            email,
            password: hashedPassword,
            name
        }
    });


    //inviare email di conferma

    const verificationToken = await generateVerificationToken(email);

    await sendVerificationEmail(verificationToken.email, verificationToken.token);

    return {success : "Email di conferma inviata!"}  
}