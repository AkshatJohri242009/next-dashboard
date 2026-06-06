import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import { adminDb } from "./admin-supabase"
import bcrypt from "bcryptjs"

async function findOrCreateDemoUser(): Promise<{ id: string; name: string; email: string } | null> {
  const db = adminDb
  if (!db) return null

  const demoEmail = process.env.DEMO_EMAIL || "demo@lifeos.app"
  const demoPassword = process.env.DEMO_PASSWORD || "demo1234"

  // Check if demo user already exists
  const { data: existing } = await db.from("User").select("id, name, email").eq("email", demoEmail).limit(1)
  if (existing && existing.length > 0) {
    return existing[0] as { id: string; name: string; email: string }
  }

  // Create demo user
  const id = crypto.randomUUID()
  const now = new Date().toISOString()
  const hashed = await bcrypt.hash(demoPassword, 12)

  const { data: user, error } = await db.from("User").insert({
    id,
    name: "Demo User",
    email: demoEmail,
    password: hashed,
    createdAt: now,
    updatedAt: now,
  }).select("id, name, email").single()

  if (error || !user) return null

  await db.from("UserProfile").insert({
    userId: user.id,
    displayName: "Demo User",
    onboardingDone: false,
    createdAt: now,
    updatedAt: now,
  })
  await db.from("UserSettings").insert({ userId: user.id, createdAt: now, updatedAt: now })

  return user as { id: string; name: string; email: string }
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    newUser: "/signup",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const demoEmail = process.env.DEMO_EMAIL || "demo@lifeos.app"
        const demoPassword = process.env.DEMO_PASSWORD || "demo1234"

        // Demo login path
        if (credentials.email === demoEmail) {
          if (credentials.password !== demoPassword) return null
          const demoUser = await findOrCreateDemoUser()
          if (!demoUser) return null
          return { id: demoUser.id, email: demoUser.email, name: demoUser.name, image: null }
        }

        // Normal login path
        const db = adminDb
        if (!db) return null

        const { data: users } = await db
          .from("User")
          .select("id, name, email, image, password")
          .or(`email.eq.${credentials.email},username.eq.${credentials.email}`)
          .limit(1)

        const user = users?.[0]
        if (!user || !user.password) return null

        const valid = await bcrypt.compare(credentials.password, user.password)
        if (!valid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? [
          GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        ;(session.user as any).id = token.id as string
      }
      return session
    },
  },
}
