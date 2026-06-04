import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await req.json()
    const results: Record<string, number> = {}

    if (body.goals && Array.isArray(body.goals)) {
      const { count } = await prisma.goal.createMany({
        data: body.goals.map((g: Record<string, unknown>) => ({
          userId: session.user.id,
          text: String(g.text || ""),
          done: Boolean(g.done),
          queued: Boolean(g.queued),
          priority: String(g.priority || "medium"),
          progress: Number(g.progress || 0),
          sortOrder: Number(g.sortOrder || 0),
        })),
      })
      results.goals = count
    }

    if (body.health) {
      await prisma.health.upsert({
        where: { userId: session.user.id },
        update: body.health,
        create: { userId: session.user.id, ...body.health },
      })
      results.health = 1
    }

    if (body.habits && Array.isArray(body.habits)) {
      const { count } = await prisma.habit.createMany({
        data: body.habits.map((h: Record<string, unknown>) => ({
          userId: session.user.id,
          name: String(h.name || ""),
          logs: h.logs || [],
          streak: Number(h.streak || 0),
        })),
      })
      results.habits = count
    }

    if (body.journal && Array.isArray(body.journal)) {
      const { count } = await prisma.journalEntry.createMany({
        data: body.journal.map((j: Record<string, unknown>) => ({
          userId: session.user.id,
          title: String(j.title || ""),
          content: String(j.content || ""),
          mood: String(j.mood || ""),
          date: String(j.date || new Date().toISOString().split("T")[0]),
        })),
      })
      results.journal = count
    }

    return NextResponse.json({ success: true, imported: results })
  } catch (err) {
    console.error("Migration error:", err)
    return NextResponse.json({ error: "Failed to migrate data" }, { status: 500 })
  }
}
