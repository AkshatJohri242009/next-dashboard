export interface Forecast {
  habitProjections: { name: string; currentStreak: number; projected7Day: number; projected30Day: number }[]
  sleepTrend: { avgHours: number; direction: "improving" | "declining" | "stable" }
  gymTrend: { weeklyAvg: number; direction: "improving" | "declining" | "stable" }
  moodTrend: { dominant: string; positivityRate: number }
  recommendations: string[]
}

export function generateForecast(): Forecast {
  const now = Date.now()
  const day = 86400000

  // Habits projection
  const rawHabits = loadJSON("lifeos_habits")
  const habits: any[] = Array.isArray(rawHabits) ? rawHabits : []
  const habitProjections = habits.map((h: any) => {
    const logs: string[] = h.logs || []
    const recent14 = logs.filter((d: string) => new Date(d).getTime() > now - 14 * day).length
    const projected7Day = Math.min(7, Math.round((recent14 / 14) * 7))
    const projected30Day = Math.round((recent14 / 14) * 30)
    return { name: h.name, currentStreak: h.streak || 0, projected7Day, projected30Day }
  })

  // Sleep trend
  const sleepLog = loadJSON("sleep_log") || {}
  const sleepEntries: any[] = Object.entries(sleepLog)
    .filter(([k]) => k.startsWith("20"))
    .map(([_, v]: [string, any]) => v)
  const recentSleep = sleepEntries.filter((e: any) => e.date && new Date(e.date).getTime() > now - 14 * day)
  const sleepHours = recentSleep.map((e: any) => parseFloat(e.hours) || 0)
  const avgHours = sleepHours.length > 0 ? Math.round((sleepHours.reduce((a: number, b: number) => a + b, 0) / sleepHours.length) * 10) / 10 : 0
  const firstWeek = sleepHours.slice(0, 7)
  const secondWeek = sleepHours.slice(7)
  const firstAvg = firstWeek.length ? firstWeek.reduce((a: number, b: number) => a + b, 0) / firstWeek.length : 0
  const secondAvg = secondWeek.length ? secondWeek.reduce((a: number, b: number) => a + b, 0) / secondWeek.length : 0
  const sleepDirection = secondAvg > firstAvg ? "improving" as const : secondAvg < firstAvg ? "declining" as const : "stable" as const

  // Gym trend
  const gymData = loadJSON("gym_dashboard_v1")
  const gymLogs: any[] = gymData?.logs || []
  const recentGym = gymLogs.filter((l: any) => l.date && new Date(l.date).getTime() > now - 28 * day)
  const weeklyAvg = recentGym.length > 0 ? Math.round((recentGym.length / 4) * 10) / 10 : 0
  const gymFirstHalf = recentGym.filter((l: any) => new Date(l.date).getTime() > now - 28 * day && new Date(l.date).getTime() <= now - 14 * day).length
  const gymSecondHalf = recentGym.filter((l: any) => new Date(l.date).getTime() > now - 14 * day).length
  const gymDirection = gymSecondHalf > gymFirstHalf ? "improving" as const : gymSecondHalf < gymFirstHalf ? "declining" as const : "stable" as const

  // Mood trend
  const journal = loadJSON("lifeos_journal") || []
  const entries: any[] = Array.isArray(journal) ? journal : []
  const recentMoods = entries.filter((e: any) => e.createdAt > now - 14 * day)
  const good = recentMoods.filter((e: any) => e.mood === "great" || e.mood === "good").length
  const bad = recentMoods.filter((e: any) => e.mood === "bad" || e.mood === "awful").length
  const totalMoods = recentMoods.length
  const positivityRate = totalMoods > 0 ? Math.round((good / totalMoods) * 100) : 0
  const counts: Record<string, number> = {}
  recentMoods.forEach((e: any) => { counts[e.mood] = (counts[e.mood] || 0) + 1 })
  const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "okay"

  // Recommendations
  const recommendations: string[] = []
  if (avgHours < 7) recommendations.push("Your sleep average is below 7h. Try setting a fixed bedtime.")
  if (weeklyAvg < 2) recommendations.push("Gym frequency is below 2x/week. Aim for consistency over intensity.")
  if (positivityRate < 50 && totalMoods >= 3) recommendations.push("Mood trends suggest stress. Consider adding mindfulness or a walk to your routine.")
  if (habitProjections.some(h => h.currentStreak > 5)) recommendations.push("You have habits on a roll. Protect your streaks — they\'re your strongest anchor.")
  if (gymDirection === "improving") recommendations.push("Your gym consistency is improving. Keep the momentum!")
  if (habitProjections.filter(h => h.projected7Day >= 5).length >= 3) recommendations.push("Strong habit projections this week. You\'re building real momentum.")
  if (recommendations.length === 0) recommendations.push("All metrics look stable. Focus on small daily improvements.")

  return { habitProjections, sleepTrend: { avgHours, direction: sleepDirection }, gymTrend: { weeklyAvg, direction: gymDirection }, moodTrend: { dominant, positivityRate }, recommendations }
}

function loadJSON(key: string): any {
  try { return JSON.parse(localStorage.getItem(key) || "null") }
  catch { return null }
}
