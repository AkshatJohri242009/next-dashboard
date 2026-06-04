import { NextResponse } from "next/server"
import { getUserByUsername } from "@/lib/jarvis-db"
import { createSessionToken } from "@/lib/jarvis-auth"
import bcrypt from "bcryptjs"

const HARDCODED_USER = "aki"
const HARDCODED_PASS = "DPS2405$"

export async function POST(req: Request) {
  try {
    const { username, password, rememberMe } = await req.json()
    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 })
    }

    const trimmed = username.trim().toLowerCase()
    const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7

    if (trimmed === HARDCODED_USER && password === HARDCODED_PASS) {
      const token = await createSessionToken("aki_hardcoded_user_id")
      const res = NextResponse.json({
        user: { id: "aki_hardcoded_user_id", username: HARDCODED_USER, is_admin: true },
      })
      res.cookies.set("jarvis_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge,
        path: "/",
      })
      return res
    }

    const user = await getUserByUsername(trimmed)
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, (user as any).password_hash)
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const token = await createSessionToken(user.id)
    const res = NextResponse.json({
      user: { id: user.id, username: user.username, is_admin: (user as any).is_admin },
    })
    res.cookies.set("jarvis_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge,
      path: "/",
    })
    return res
  } catch (err: any) {
    console.error("Login error:", err)
    return NextResponse.json({ error: err.message || "Login failed" }, { status: 500 })
  }
}
