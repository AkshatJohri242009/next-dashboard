import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { adminDb, withTimestamps } from "@/lib/admin-supabase"

const TYPE_TABLE_MAP: Record<string, string> = {
  goals: "Goal",
  health: "Health",
  gym: "Gym",
  habits: "Habit",
  journal: "JournalEntry",
  sleep: "SleepEntry",
  weight: "WeightEntry",
  reminders: "Reminder",
  chapters: "Chapter",
  missions: "Mission",
  decisions: "Decision",
  ideas: "Idea",
  timeline: "TimelineEvent",
  studyTasks: "StudyTask",
  studyFiles: "StudyFile",
  studyScores: "StudyScore",
  examDates: "ExamDate",
  stocks: "StockHolding",
  projects: "TrackedProject",
  notifications: "Notification",
  water: "WaterLog",
  settings: "UserSettings",
  profile: "UserProfile",
}

const SINGLETON_TABLES = new Set(["Health", "Gym", "UserSettings", "UserProfile"])

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const type = req.nextUrl.pathname.split("/").pop()
  const table = type ? TYPE_TABLE_MAP[type] : null
  if (!table) return NextResponse.json({ error: "Invalid type" }, { status: 400 })

  const db = adminDb
  if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 500 })

  try {
    const query = db.from(table).select("*").eq("userId", session.user.id)

    if (SINGLETON_TABLES.has(table)) {
      const { data } = await query.single()
      return NextResponse.json(data || null)
    }

    const { data } = await query.order("createdAt", { ascending: false })
    return NextResponse.json(data || [])
  } catch (err) {
    console.error(`Error fetching ${type}:`, err)
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const type = req.nextUrl.pathname.split("/").pop()
  const table = type ? TYPE_TABLE_MAP[type] : null
  if (!table) return NextResponse.json({ error: "Invalid type" }, { status: 400 })

  const db = adminDb
  if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 500 })

  try {
    const body = await req.json()

    if (SINGLETON_TABLES.has(table)) {
      const { data: existing } = await db.from(table).select("id").eq("userId", session.user.id).limit(1)
      if (existing && existing.length > 0) {
        const { data } = await db.from(table).update(body).eq("userId", session.user.id).select().single()
        return NextResponse.json(data)
      }
    }

    const record = withTimestamps({ ...body, userId: session.user.id })
    const { data, error } = await db
      .from(table)
      .insert(record)
      .select()
      .single()

    if (error) {
      console.error(`Error creating ${type}:`, error)
      return NextResponse.json({ error: "Failed to create" }, { status: 500 })
    }
    return NextResponse.json(data, { status: 201 })
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
  const table = type ? TYPE_TABLE_MAP[type] : null
  if (!table || !id) return NextResponse.json({ error: "Invalid type or id" }, { status: 400 })

  const db = adminDb
  if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 500 })

  try {
    const body = await req.json()
    const { data, error } = await db
      .from(table)
      .update({ ...body, updatedAt: new Date().toISOString() })
      .eq("id", id)
      .eq("userId", session.user.id)
      .select()
      .single()

    if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(data)
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
  const table = type ? TYPE_TABLE_MAP[type] : null
  if (!table || !id) return NextResponse.json({ error: "Invalid type or id" }, { status: 400 })

  const db = adminDb
  if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 500 })

  try {
    const { error } = await db.from(table).delete().eq("id", id).eq("userId", session.user.id)
    if (error) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(`Error deleting ${type}:`, err)
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
  }
}
