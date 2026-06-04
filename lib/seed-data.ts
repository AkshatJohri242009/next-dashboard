import { prisma } from "@/lib/prisma"

export async function seedUserData(userId: string) {
  const existingProfile = await prisma.userProfile.findUnique({ where: { userId } })
  if (existingProfile?.onboardingDone) return { seeded: false }

  const [goals, habits, journal, studyTasks] = await Promise.all([
    prisma.goal.createMany({
      data: [
        { userId, text: "Complete Chapter 1 of Mathematics", priority: "high", sortOrder: 0 },
        { userId, text: "Review Physics notes", priority: "medium", sortOrder: 1 },
        { userId, text: "Take Chemistry practice test", priority: "high", sortOrder: 2 },
        { userId, text: "Study for 2 hours", priority: "medium", sortOrder: 3 },
        { userId, text: "Log today's meals", priority: "low", sortOrder: 4 },
      ],
    }),
    prisma.habit.createMany({
      data: [
        { userId, name: "Morning meditation", logs: [], streak: 0 },
        { userId, name: "Read for 20 minutes", logs: [], streak: 0 },
        { userId, name: "Drink 8 glasses of water", logs: [], streak: 0 },
      ],
    }),
    prisma.journalEntry.create({
      data: {
        userId,
        title: "Welcome to LifeOS!",
        content: "This is your first journal entry. Start tracking your thoughts, achievements, and reflections.",
        mood: "great",
        date: new Date().toISOString().split("T")[0],
      },
    }),
    prisma.studyTask.createMany({
      data: [
        { userId, text: "Review Chapter 1 - Algebra", subject: "Mathematics", done: false },
        { userId, text: "Complete problem set 1A", subject: "Mathematics", done: false },
        { userId, text: "Read Chapter 3 - Thermodynamics", subject: "Physics", done: false },
        { userId, text: "Memorize periodic table groups", subject: "Chemistry", done: false },
      ],
    }),
  ])

  await prisma.userProfile.upsert({
    where: { userId },
    update: { onboardingDone: true },
    create: { userId, onboardingDone: true },
  })

  return {
    seeded: true,
    goals: goals.count,
    habits: habits.count,
    journal: 1,
    studyTasks: studyTasks.count,
  }
}
