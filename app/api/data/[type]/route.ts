import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const MODEL_MAP: Record<string, string> = {
  goals: "goal",
  health: "health",
  gym: "gym",
  habits: "habit",
  journal: "journalEntry",
  sleep: "sleepEntry",
  weight: "weightEntry",
  reminders: "reminder",
  chapters: "chapter",
  missions: "mission",
  decisions: "decision",
  ideas: "idea",
  timeline: "timelineEvent",
  studyTasks: "studyTask",
  studyFiles: "studyFile",
  studyScores: "studyScore",
  examDates: "examDate",
  stocks: "stockHolding",
  projects: "trackedProject",
  notifications: "notification",
  water: "waterLog",
}

const UNIQUE_TYPES = ["health", "gym", "settings", "profile"]

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const type = req.nextUrl.pathname.split("/").pop()
  const model = type ? MODEL_MAP[type] : null
  if (!model) return NextResponse.json({ error: "Invalid type" }, { status: 400 })

  try {
    const data = await (prisma as any)[model].findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(data)
  } catch (err) {
    console.error(`Error fetching ${type}:`, err)
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const type = req.nextUrl.pathname.split("/").pop()
  const model = type ? MODEL_MAP[type] : null
  if (!model) return NextResponse.json({ error: "Invalid type" }, { status: 400 })

  try {
    const body = await req.json()

    if (UNIQUE_TYPES.includes(type!)) {
      const existing = await (prisma as any)[model].findUnique({
        where: { userId: session.user.id },
      })
      if (existing) {
        const updated = await (prisma as any)[model].update({
          where: { id: existing.id },
          data: body,
        })
        return NextResponse.json(updated)
      }
    }

    const record = await (prisma as any)[model].create({
      data: { ...body, userId: session.user.id },
    })
    return NextResponse.json(record, { status: 201 })
  } catch (err) {
    console.error(`Error creating ${type}:`, err)
    return NextResponse.json({ error: "Failed to create" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const segments = req.nextUrl.pathname.split("/")
  const type = segments[segments.length - 2]
  const id = segments[segments.length - 1]
  const model = type ? MODEL_MAP[type] : null
  if (!model || !id) return NextResponse.json({ error: "Invalid type or id" }, { status: 400 })

  try {
    const body = await req.json()
    const record = await (prisma as any)[model].updateMany({
      where: { id, userId: session.user.id },
      data: body,
    })
    if (record.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(`Error updating ${type}:`, err)
    return NextResponse.json({ error: "Failed to update" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const segments = req.nextUrl.pathname.split("/")
  const type = segments[segments.length - 2]
  const id = segments[segments.length - 1]
  const model = type ? MODEL_MAP[type] : null
  if (!model || !id) return NextResponse.json({ error: "Invalid type or id" }, { status: 400 })

  try {
    const record = await (prisma as any)[model].deleteMany({
      where: { id, userId: session.user.id },
    })
    if (record.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(`Error deleting ${type}:`, err)
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
  }
}
