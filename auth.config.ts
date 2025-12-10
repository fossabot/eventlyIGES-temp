
import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { LoginSchema } from "./schemas"
import { getUserByEmail } from "./data/user";
import bcrypt from "bcryptjs";



export default {
  providers: [
    Credentials({
      async authorize(credentials) {
      console.log("DEBUG: credentials ricevute:", credentials);


        const validatedFields = await LoginSchema.safeParseAsync(credentials);
        if (!validatedFields.success) return null;

        const { email, password } = validatedFields.data;

        const user = await getUserByEmail(email);
        if (!user || !user.password) return null;

        if (password === user.password) {
          return {
            id: user.id,
            email: user.email,
            name: user.name ?? undefined
          };
        }

        return null;
      }
    })
  ],
  trustHost: true
} satisfies NextAuthConfig;