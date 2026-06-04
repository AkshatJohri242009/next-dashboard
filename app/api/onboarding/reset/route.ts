import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { seedUserData } from "@/lib/seed-data"

const USER_DATA_TABLES = [
  "goal", "health", "gym", "habit", "journalEntry", "sleepEntry",
  "weightEntry", "reminder", "notification", "chapter", "mission",
  "decision", "idea", "timelineEvent", "studyTask", "studyFile",
  "studyScore", "examDate", "stockHolding", "stockQuote",
  "trackedProject", "waterLog",
] as const

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    for (const table of USER_DATA_TABLES) {
      await (prisma as any)[table].deleteMany({ where: { userId: session.user.id } })
    }

    const result = await seedUserData(session.user.id)

    return NextResponse.json({ success: true, ...result })
  } catch (err) {
    console.error("Reset error:", err)
    return NextResponse.json({ error: "Failed to reset account" }, { status: 500 })
  }
}
