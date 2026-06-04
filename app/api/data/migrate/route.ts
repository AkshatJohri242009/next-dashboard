import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { adminDb } from "@/lib/admin-supabase"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const db = adminDb
  if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 500 })

  try {
    const body = await req.json()
    const now = new Date().toISOString()
    const results: Record<string, number> = {}

    if (body.goals && Array.isArray(body.goals)) {
      const rows = body.goals.map((g: Record<string, unknown>) => ({
        userId: session.user.id,
        text: String(g.text || ""),
        done: Boolean(g.done),
        queued: Boolean(g.queued),
        priority: String(g.priority || "medium"),
        progress: Number(g.progress || 0),
        sortOrder: Number(g.sortOrder || 0),
        createdAt: now,
        updatedAt: now,
      }))
      const { data } = await db.from("Goal").insert(rows).select()
      results.goals = data?.length || 0
    }

    if (body.health) {
      const { data: existing } = await db.from("Health").select("id").eq("userId", session.user.id).limit(1)
      if (existing && existing.length > 0) {
        await db.from("Health").update(body.health).eq("userId", session.user.id)
      } else {
        await db.from("Health").insert({ userId: session.user.id, ...body.health })
      }
      results.health = 1
    }

    if (body.habits && Array.isArray(body.habits)) {
      const rows = body.habits.map((h: Record<string, unknown>) => ({
        userId: session.user.id,
        name: String(h.name || ""),
        logs: h.logs || [],
        streak: Number(h.streak || 0),
        createdAt: now,
        updatedAt: now,
      }))
      const { data } = await db.from("Habit").insert(rows).select()
      results.habits = data?.length || 0
    }

    if (body.journal && Array.isArray(body.journal)) {
      const rows = (body.journal as Record<string, unknown>[]).map((j) => ({
        userId: session.user.id,
        title: String(j.title || ""),
        content: String(j.content || ""),
        mood: String(j.mood || ""),
        date: String(j.date || now.split("T")[0]),
        createdAt: now,
        updatedAt: now,
      }))
      const { data } = await db.from("JournalEntry").insert(rows).select()
      results.journal = data?.length || 0
    }

    return NextResponse.json({ success: true, imported: results })
  } catch (err) {
    console.error("Migration error:", err)
    return NextResponse.json({ error: "Failed to migrate data" }, { status: 500 })
  }
}
