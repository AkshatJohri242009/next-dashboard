import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { adminDb } from "@/lib/admin-supabase"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const db = adminDb
  if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 500 })

  try {
    const { currentPassword, newPassword } = await req.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Current and new password required" }, { status: 400 })
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    const { data: user } = await db
      .from("User")
      .select("password")
      .eq("id", session.user.id)
      .single()

    if (!user?.password) {
      return NextResponse.json({ error: "Cannot change password for OAuth accounts" }, { status: 400 })
    }

    const valid = await bcrypt.compare(currentPassword, user.password)
    if (!valid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 })
    }

    const hashed = await bcrypt.hash(newPassword, 12)
    await db.from("User").update({ password: hashed }).eq("id", session.user.id)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Change password error:", err)
    return NextResponse.json({ error: "Failed to change password" }, { status: 500 })
  }
}
