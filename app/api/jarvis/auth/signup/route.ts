import { NextResponse } from "next/server"
import { getUserByUsername, createUser, countUsers } from "@/lib/jarvis-db"
import { createSessionToken } from "@/lib/jarvis-auth"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json()
    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 })
    }
    if (password.length < 4) {
      return NextResponse.json({ error: "Password must be at least 4 characters" }, { status: 400 })
    }

    const existing = await getUserByUsername(username.trim().toLowerCase())
    if (existing) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const userCount = await countUsers()
    const user = await createUser(username.trim().toLowerCase(), passwordHash)

    if (!user) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }

    if (userCount === 0) {
      const { jarvisDb } = await import("@/lib/jarvis-db")
      await jarvisDb!.from("jarvis_users").update({ is_admin: true }).eq("id", user.id)
      ;(user as any).is_admin = true
    }

    const token = await createSessionToken(user.id)
    const res = NextResponse.json({ user })
    res.cookies.set("jarvis_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })
    return res
  } catch (err: any) {
    console.error("Signup error:", err)
    return NextResponse.json({ error: err.message || "Signup failed" }, { status: 500 })
  }
}
