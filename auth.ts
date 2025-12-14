import { PrismaAdapter } from "@auth/prisma-adapter"
import authConfig from "@/auth.config" 
import { db } from "@/lib/db"
import { getUserById } from "@/data/user" 
import NextAuth from "next-auth"
import { UserRole } from "@prisma/client"
 


export const { auth, handlers: { GET, POST }, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,

  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },

  events: {
    async linkAccount({ user }) {
      await db.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      })
    },
  },

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "credentials") return false
      return true
    },

    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub
      }
      if (token.role && session.user) {
        session.user.role = token.role as UserRole
      }
      if (session.user) {
        session.user.name = token.name ?? ""
        session.user.email = token.email ?? ""
      }
      return session
    },

    async jwt({ token }) {
      if (!token.sub) return token
      const existingUser = await getUserById(token.sub)
      if (!existingUser) return token

      token.role = existingUser.role
      token.name = existingUser.name
      token.email = existingUser.email
      return token
    },
  },

  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },

  ...authConfig,
})
