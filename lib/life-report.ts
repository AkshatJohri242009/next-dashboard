"use client"

export interface LifeReport {
  year: number
  generatedAt: string
  totalGoals: number
  completedGoals: number
  gymSessions: number
  journalEntries: number
  habitsTracked: number
  longestHabitStreak: number
  decisionsMade: number
  positiveDecisions: number
  missionsCompleted: number
  chaptersCompleted: number
  avgSleep: number
  bestMonth: string
  topAchievements: string[]
  growthAreas: string[]
  stats: LifeReportStat[]
  quote: string
}

export interface LifeReportStat {
  label: string
  value: string | number
  icon: string
  subtitle: string
}

function loadJSON(key: string): any {
  try { return JSON.parse(localStorage.getItem(key) || "null") }
  catch { return null }
}

export function generateLifeReport(year?: number): LifeReport {
  const targetYear = year || new Date().getFullYear()
  const startDate = `${targetYear}-01-01`
  const endDate = `${targetYear}-12-31`

  // Goals
  let totalGoals = 0
  let completedGoals = 0
  const startMs = new Date(startDate).getTime()
  const endMs = new Date(endDate).getTime()

  const monthTotals: Record<string, number> = {}
  for (let d = new Date(startMs); d.getTime() <= endMs; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().slice(0, 10)
    const goals = loadJSON(`goals:${dateStr}`) || []
    totalGoals += goals.length
    completedGoals += goals.filter((g: any) => g.done).length
    if (goals.length > 0) {
      const month = dateStr.slice(0, 7)
      monthTotals[month] = (monthTotals[month] || 0) + goals.filter((g: any) => g.done).length
    }
  }

  const bestMonth = Object.entries(monthTotals).sort((a, b) => b[1] - a[1])[0]?.[0]
    ? new Date(Object.entries(monthTotals).sort((a, b) => b[1] - a[1])[0][0] + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "N/A"

  // Gym
  const gymData = loadJSON("gym_dashboard_v1")
  const gymSessions = (gymData?.logs || []).filter((l: any) => {
    const t = new Date(l.date).getTime()
    return t >= startMs && t <= endMs
  }).length

  // Journal
  const journal = loadJSON("lifeos_journal") || []
  const yearEntries = Array.isArray(journal) ? journal.filter((e: any) => {
    const t = new Date(e.createdAt).getTime()
    return t >= startMs && t <= endMs
  }) : []

  // Habits
  const habits = loadJSON("lifeos_habits") || []
  const longestHabitStreak = Math.max(...habits.map((h: any) => h.streak || 0), 0)

  // Decisions
  const decisions = loadJSON("lifeos_decisions") || []
  const yearDecisions = Array.isArray(decisions) ? decisions.filter((d: any) => {
    const t = new Date(d.createdAt).getTime()
    return t >= startMs && t <= endMs
  }) : []
  const positiveDecisions = yearDecisions.filter((d: any) => d.outcome === "positive").length

  // Missions
  const missions = loadJSON("lifeos_missions") || []
  const yearMissions = Array.isArray(missions) ? missions.filter((m: any) => new Date(m.createdAt).getTime() >= startMs) : []
  const completedMissions = yearMissions.filter((m: any) => m.status === "completed").length

  // Learning
  const chapters = loadJSON("lifeos_chapters") || []
  const yearChapters = Array.isArray(chapters) ? chapters.filter((c: any) => c.date && new Date(c.date).getTime() >= startMs) : []
  const completedChapters = yearChapters.filter((c: any) => c.completed).length

  // Sleep
  const sleepLog = loadJSON("sleep_log") || {}
  const yearSleep = Object.values(sleepLog as Record<string, any>).filter((e: any) => e?.date && new Date(e.date).getTime() >= startMs && new Date(e.date).getTime() <= endMs)
  const avgSleep = yearSleep.length > 0 ? yearSleep.reduce((a: number, e: any) => a + (parseFloat(e.hours) || 0), 0) / yearSleep.length : 0

  // Stats
  const stats: LifeReportStat[] = [
    { label: "Goals Completed", value: completedGoals, icon: "🎯", subtitle: `out of ${totalGoals} total goals` },
    { label: "Gym Sessions", value: gymSessions, icon: "💪", subtitle: `~${Math.round(gymSessions / 12)}/month` },
    { label: "Journal Entries", value: yearEntries.length, icon: "📝", subtitle: `~${Math.round(yearEntries.length / 12)}/month` },
    { label: "Habits Tracked", value: habits.length, icon: "🔥", subtitle: `longest streak: ${longestHabitStreak} days` },
    { label: "Decisions Made", value: yearDecisions.length, icon: "🧠", subtitle: `${positiveDecisions} positive outcomes` },
    { label: "Missions Completed", value: completedMissions, icon: "🏆", subtitle: `${yearMissions.length} total missions` },
    { label: "Chapters Completed", value: completedChapters, icon: "📚", subtitle: `across ${new Set(yearChapters.map((c: any) => c.subject)).size} subjects` },
    { label: "Avg Sleep", value: `${avgSleep.toFixed(1)}h`, icon: "🌙", subtitle: `${yearSleep.length} nights tracked` },
  ]

  const topAchievements: string[] = []
  if (completedGoals > 0) topAchievements.push(`Completed ${completedGoals} goals across the year`)
  if (gymSessions > 50) topAchievements.push(`Hit the gym ${gymSessions} times — ${gymSessions > 100 ? "elite consistency" : "strong dedication"}`)
  if (completedMissions > 0) topAchievements.push(`Completed ${completedMissions} life missions`)
  if (longestHabitStreak > 30) topAchievements.push(`Built a ${longestHabitStreak}-day habit streak`)
  if (yearEntries.length > 50) topAchievements.push(`Journaled ${yearEntries.length} times — deep self-reflection`)
  if (avgSleep >= 7) topAchievements.push(`Maintained ${avgSleep.toFixed(1)}h average sleep — health-first mindset`)
  if (positiveDecisions > 0 && yearDecisions.length > 0) topAchievements.push(`${Math.round(positiveDecisions / yearDecisions.length * 100)}% positive decision rate`)
  if (topAchievements.length === 0) topAchievements.push(`${targetYear} was a foundation year. Building the systems.`)

  const growthAreas: string[] = []
  if (gymSessions < 50) growthAreas.push("Increase gym consistency")
  if (avgSleep < 7) growthAreas.push("Improve sleep duration and regularity")
  if (yearEntries.length < 30) growthAreas.push("Journal more frequently for better self-awareness")
  if (longestHabitStreak < 30) growthAreas.push("Build longer habit streaks")
  if (completedMissions === 0) growthAreas.push("Set and complete at least one major mission")
  if (growthAreas.length === 0) growthAreas.push("Maintain the excellent trajectory you've built")

  const quotes = [
    "Life is not about waiting for the storm to pass, but learning to dance in the rain.",
    "The best time to plant a tree was 20 years ago. The second best time is now.",
    "Small daily improvements over time lead to stunning results.",
    "The only person you are destined to become is the person you decide to be.",
    "Your life does not get better by chance, it gets better by change.",
    "The secret of getting ahead is getting started.",
    "Success is the sum of small efforts repeated day in and day out.",
  ]

  return {
    year: targetYear,
    generatedAt: new Date().toISOString(),
    totalGoals,
    completedGoals,
    gymSessions,
    journalEntries: yearEntries.length,
    habitsTracked: habits.length,
    longestHabitStreak,
    decisionsMade: yearDecisions.length,
    positiveDecisions,
    missionsCompleted: completedMissions,
    chaptersCompleted: completedChapters,
    avgSleep: Math.round(avgSleep * 10) / 10,
    bestMonth,
    topAchievements,
    growthAreas,
    stats,
    quote: quotes[Math.floor(Math.random() * quotes.length)],
  }
}
