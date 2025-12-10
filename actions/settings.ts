"use server";

import * as z from "zod";

import { SettingsSchema } from "@/schemas"
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getUserByEmail, getUserById } from "@/data/user";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";
import bcrypt from "bcryptjs";

export const settings = async (
    values:z.infer<typeof SettingsSchema>
) => {

    const user = await currentUser();

    if(!user){
        return { error: "Non autorizzato" };
    }

    const dbUser = await getUserById(user.id!);

    if(!dbUser){
        return { error: "Non autorizzato" };
    }

    if(values.password?.trim() === "" || values.password?.trim() === "" ){
        values.password = undefined;
        values.newPassword = undefined;
    }
    

    if(values.email && values.email !== user.email){
        const existingUser = await getUserByEmail(values.email);
        if(existingUser && existingUser.id !== user.id){
            return { error: "Email già in uso da un altro utente" };
        }

        const verificationToken = await generateVerificationToken(values.email);
        await sendVerificationEmail(verificationToken.email, verificationToken.token);

        return { success: "Email di verifica inviata" };
    }

    if(values.password && values.newPassword && dbUser.password){
        const passwordsMatch = await bcrypt.compare(values.password, dbUser.password);
        
        if(!passwordsMatch){
            return { error: "Password non corretta" };
        }

        const hashedPassword = await bcrypt.hash(values.newPassword, 10);

        values.password = hashedPassword;
        values.newPassword = undefined;
    }

    await db.user.update ({
        where: {
            id: dbUser.id
        },
        data: {
            ...values,

        }
    })

    return { success: "Impostazioni aggiornate" };
}