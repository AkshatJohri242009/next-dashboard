import { NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/admin-supabase"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    const db = adminDb
    if (!db) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    const { data: existing } = await db.from("User").select("id").eq("email", email).limit(1)
    if (existing && existing.length > 0) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 })
    }

    const hashed = await bcrypt.hash(password, 12)
    const id = crypto.randomUUID()
    const now = new Date().toISOString()

    const { data: user, error } = await db
      .from("User")
      .insert({
        id,
        name,
        email,
        password: hashed,
        createdAt: now,
        updatedAt: now,
      })
      .select("id, name, email")
      .single()

    if (error || !user) {
      console.error("Supabase insert error:", error)
      return NextResponse.json({ error: "Failed to create user: " + (error?.message || "Unknown") }, { status: 500 })
    }

    await db.from("UserProfile").insert({ userId: user.id, displayName: name, createdAt: now, updatedAt: now })
    await db.from("UserSettings").insert({ userId: user.id, createdAt: now, updatedAt: now })

    return NextResponse.json({ id: user.id, name: user.name, email: user.email })
  } catch (err) {
    console.error("Signup error:", err)
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
