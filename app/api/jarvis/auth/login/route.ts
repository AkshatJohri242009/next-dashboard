import { NextResponse } from "next/server"
import { getUserByUsername } from "@/lib/jarvis-db"
import { createSessionToken } from "@/lib/jarvis-auth"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json()
    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 })
    }

    const user = await getUserByUsername(username.trim().toLowerCase())
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const token = await createSessionToken(user.id)
    const res = NextResponse.json({
      user: { id: user.id, username: user.username, is_admin: user.is_admin },
    })
    res.cookies.set("jarvis_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })
    return res
  } catch (err: any) {
    console.error("Login error:", err)
    return NextResponse.json({ error: err.message || "Login failed" }, { status: 500 })
  }
}
