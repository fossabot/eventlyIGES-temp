"use server";

import * as z from "zod";
import { SettingsSchema } from "@/schemas";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getUserByEmail } from "@/data/user";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";
import bcrypt from "bcryptjs";

export const settings = async (values: z.infer<typeof SettingsSchema>) => {
  const current = await currentUser();
  if (!current) return { error: "Non autorizzato" };

  const dbUser = await db.user.findUnique({
    where: { id: current.id },
    select: {
      id: true,
      name: true,
      email: true,
      password: true, 
    },
  });
  if (!dbUser) return { error: "Non autorizzato" };

  const updates: Partial<typeof values> = {};

  if (values.name && values.name !== dbUser.name) {
    updates.name = values.name;
  }

  if (values.password?.trim() && values.newPassword?.trim() && dbUser.password) {
    const passwordsMatch = await bcrypt.compare(values.password, dbUser.password);
    if (!passwordsMatch) return { error: "Password non corretta" };
    updates.password = await bcrypt.hash(values.newPassword, 10);
  }

  if (values.email && values.email !== dbUser.email) {
    const existingUser = await getUserByEmail(values.email);
    if (existingUser && existingUser.id !== dbUser.id) {
      return { error: "Email già in uso da un altro utente" };
    }

    const verificationToken = await generateVerificationToken(values.email);

    // Invio email asincrono per non bloccare il flusso
    sendVerificationEmail(verificationToken.email, verificationToken.token).catch(console.error);

    return { success: "Email di verifica inviata" };
  }

  // Aggiornamento dati se ci sono modifiche
  if (Object.keys(updates).length > 0) {
    await db.user.update({
      where: { id: dbUser.id },
      data: updates,
    });
  }

  return { success: "Impostazioni aggiornate" };
};
