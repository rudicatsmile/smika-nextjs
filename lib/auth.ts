import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"
import { Role } from "@/app/generated/prisma/enums"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: Role
      nip?: string | null
      employeeId?: string | null
    }
  }
  interface User {
    id: string
    role: Role
    nip?: string | null
    employeeId?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: Role
    nip?: string | null
    employeeId?: string | null
  }
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "simka9-development-secret-key-super-secure-token-2026",
  session: { strategy: "jwt" },
  debug: process.env.NODE_ENV === "development",
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "NIP / Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) return null

        try {
          const user = await prisma.user.findFirst({
            where: {
              OR: [
                { email: credentials.identifier },
                { nip: credentials.identifier },
              ],
              isActive: true,
            },
          })

          if (!user) return null

          const isValid = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          )
          if (!isValid) return null

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            nip: user.nip,
            employeeId: user.employeeId,
          }
        } catch (error) {
          console.error("Database connection error in authorize():", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.nip = user.nip
        token.employeeId = user.employeeId
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as Role
        session.user.nip = token.nip as string | null
        session.user.employeeId = token.employeeId as string | null
      }
      return session
    },
  },
}
