import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { prisma } from "./prisma"

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email dan password wajib diisi")
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        // Pesan yang sama untuk email tidak ada maupun password salah.
        // Membedakan keduanya membocorkan email admin mana yang terdaftar,
        // sehingga penyerang bisa memetakan akun sebelum menebak password.
        const INVALID_CREDENTIALS = "Email atau password salah"

        if (!user) {
          throw new Error(INVALID_CREDENTIALS)
        }

        const isValid = await compare(credentials.password, user.password)
        if (!isValid) {
          throw new Error(INVALID_CREDENTIALS)
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
}

import { getServerSession as gss } from "next-auth"

export async function getServerSession() {
  return gss(authOptions)
}
