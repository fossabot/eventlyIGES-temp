"use server"

import { LoginSchema } from "@/schemas"
import { z } from "zod"
import { signIn } from "@/auth"
import { DEFAULT_LOGIN_REDIRECT } from "@/routes"
import { AuthError } from "next-auth"
import { getUserByEmail } from "@/data/user"
import { generateVerificationToken } from "@/lib/tokens"
import { sendVerificationEmail } from "@/lib/mail"

export const login = async (values: z.infer<typeof LoginSchema>, callbackUrl?: string) => {

  // Validazione
  const validatedFields = await LoginSchema.safeParseAsync(values);
  if (!validatedFields.success) {
   
    return { error: "Campi non validi" };
  }

  const { email, password } = validatedFields.data;


  // Ricerca utente
  const existingUser = await getUserByEmail(email);
  if (!existingUser || !existingUser.password || !existingUser.email) {
    
    return { error: "Email non trovata" };
  }

  if (!existingUser.emailVerified) {
    const verificationToken = await generateVerificationToken(existingUser.email);
    await sendVerificationEmail(verificationToken.email, verificationToken.token);
  
    return { success: "Email di conferma inviata!" };
  }

  // Login
  try {

    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl || DEFAULT_LOGIN_REDIRECT,
    });
  
  } catch (error) {
   
    // Resto del blocco catch
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Credenziali non valide" };
        default:
          return { error: "Errore di autenticazione" };
      }
    }

    throw error; // Rilancia errori sconosciuti
  }
};