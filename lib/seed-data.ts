import { adminDb, withTimestamps } from "@/lib/admin-supabase"

export async function seedUserData(userId: string) {
  const db = adminDb
  if (!db) throw new Error("Database not configured")

  const { data: profile } = await db
    .from("UserProfile")
    .select("onboardingDone")
    .eq("userId", userId)
    .single()

  if (profile?.onboardingDone) return { seeded: false }

  const today = new Date().toISOString().split("T")[0]

  await db.from("Goal").insert([
    withTimestamps({ userId, text: "Complete Chapter 1 of Mathematics", priority: "high", sortOrder: 0 }),
    withTimestamps({ userId, text: "Review Physics notes", priority: "medium", sortOrder: 1 }),
    withTimestamps({ userId, text: "Take Chemistry practice test", priority: "high", sortOrder: 2 }),
    withTimestamps({ userId, text: "Study for 2 hours", priority: "medium", sortOrder: 3 }),
    withTimestamps({ userId, text: "Log today's meals", priority: "low", sortOrder: 4 }),
  ])

  await db.from("Habit").insert([
    withTimestamps({ userId, name: "Morning meditation", logs: [], streak: 0 }),
    withTimestamps({ userId, name: "Read for 20 minutes", logs: [], streak: 0 }),
    withTimestamps({ userId, name: "Drink 8 glasses of water", logs: [], streak: 0 }),
  ])

  await db.from("JournalEntry").insert(
    withTimestamps({ userId, title: "Welcome to LifeOS!", content: "This is your first journal entry. Start tracking your thoughts, achievements, and reflections.", mood: "great", date: today })
  )

  await db.from("StudyTask").insert([
    withTimestamps({ userId, text: "Review Chapter 1 - Algebra", subject: "Mathematics", done: false }),
    withTimestamps({ userId, text: "Complete problem set 1A", subject: "Mathematics", done: false }),
    withTimestamps({ userId, text: "Read Chapter 3 - Thermodynamics", subject: "Physics", done: false }),
    withTimestamps({ userId, text: "Memorize periodic table groups", subject: "Chemistry", done: false }),
  ])

  await db.from("UserProfile").update({ onboardingDone: true }).eq("userId", userId)

  return { seeded: true }
}
