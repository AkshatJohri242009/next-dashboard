import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { adminDb } from "@/lib/admin-supabase"
import { seedUserData } from "@/lib/seed-data"

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const db = adminDb
  if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 500 })

  try {
    const result = await seedUserData(session.user.id)
    return NextResponse.json(result)
  } catch (err) {
    console.error("Seed error:", err)
    return NextResponse.json({ error: "Failed to seed data" }, { status: 500 })
  }
}
