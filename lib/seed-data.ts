import { adminDb } from "@/lib/admin-supabase"

export async function seedUserData(userId: string) {
  const db = adminDb
  if (!db) throw new Error("Database not configured")

  const { data: profile } = await db
    .from("UserProfile")
    .select("onboardingDone")
    .eq("userId", userId)
    .single()

  if (profile?.onboardingDone) return { seeded: false }

  const now = new Date().toISOString()
  const today = now.split("T")[0]

  await db.from("Goal").insert([
    { userId, text: "Complete Chapter 1 of Mathematics", priority: "high", sortOrder: 0, createdAt: now, updatedAt: now },
    { userId, text: "Review Physics notes", priority: "medium", sortOrder: 1, createdAt: now, updatedAt: now },
    { userId, text: "Take Chemistry practice test", priority: "high", sortOrder: 2, createdAt: now, updatedAt: now },
    { userId, text: "Study for 2 hours", priority: "medium", sortOrder: 3, createdAt: now, updatedAt: now },
    { userId, text: "Log today's meals", priority: "low", sortOrder: 4, createdAt: now, updatedAt: now },
  ])

  await db.from("Habit").insert([
    { userId, name: "Morning meditation", logs: [], streak: 0, createdAt: now, updatedAt: now },
    { userId, name: "Read for 20 minutes", logs: [], streak: 0, createdAt: now, updatedAt: now },
    { userId, name: "Drink 8 glasses of water", logs: [], streak: 0, createdAt: now, updatedAt: now },
  ])

  await db.from("JournalEntry").insert({
    userId,
    title: "Welcome to LifeOS!",
    content: "This is your first journal entry. Start tracking your thoughts, achievements, and reflections.",
    mood: "great",
    date: today,
    createdAt: now,
    updatedAt: now,
  })

  await db.from("StudyTask").insert([
    { userId, text: "Review Chapter 1 - Algebra", subject: "Mathematics", done: false, createdAt: now, updatedAt: now },
    { userId, text: "Complete problem set 1A", subject: "Mathematics", done: false, createdAt: now, updatedAt: now },
    { userId, text: "Read Chapter 3 - Thermodynamics", subject: "Physics", done: false, createdAt: now, updatedAt: now },
    { userId, text: "Memorize periodic table groups", subject: "Chemistry", done: false, createdAt: now, updatedAt: now },
  ])

  await db.from("UserProfile").update({ onboardingDone: true }).eq("userId", userId)

  return { seeded: true }
}
