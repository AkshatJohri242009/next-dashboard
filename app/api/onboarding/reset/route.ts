import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { adminDb } from "@/lib/admin-supabase"
import { seedUserData } from "@/lib/seed-data"

const TABLES = [
  "Goal", "Health", "Gym", "Habit", "JournalEntry", "SleepEntry",
  "WeightEntry", "Reminder", "Notification", "Chapter", "Mission",
  "Decision", "Idea", "TimelineEvent", "StudyTask", "StudyFile",
  "StudyScore", "ExamDate", "StockHolding", "StockQuote",
  "TrackedProject", "WaterLog",
]

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const db = adminDb
  if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 500 })

  try {
    for (const table of TABLES) {
      await db.from(table).delete().eq("userId", session.user.id)
    }

    const result = await seedUserData(session.user.id)
    return NextResponse.json({ success: true, ...result })
  } catch (err) {
    console.error("Reset error:", err)
    return NextResponse.json({ error: "Failed to reset account" }, { status: 500 })
  }
}
