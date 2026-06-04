"use client"

export interface TrajectoryProjection {
  metric: string
  category: string
  currentValue: number
  projected3Month: number
  projected6Month: number
  projected1Year: number
  unit: string
  confidence: number
  trend: "improving" | "declining" | "stable"
  risk: string | null
  opportunity: string | null
}

export interface FutureSelfReport {
  projections: TrajectoryProjection[]
  summary: string
  overallAssessment: string
  risks: string[]
  opportunities: string[]
  generatedAt: number
}

import type { Goal, Habit, JournalEntry, GymState } from "./types"
import { loadJSON } from "./utils"

export function generateProjections(): FutureSelfReport {
  const now = Date.now()
  const day = 86400000
  const projections: TrajectoryProjection[] = []
  const risks: string[] = []
  const opportunities: string[] = []

  // Gym projections
  const gymData: GymState | null = loadJSON("gym_dashboard_v1")
  const gymLogs = gymData?.logs || []
  const recentGym = gymLogs.filter(l => l.at > now - 60 * day)
  const gymWeekly = recentGym.length / 8.57 // ~60 days = 8.57 weeks
  projections.push({
    metric: "Gym Sessions",
    category: "fitness",
    currentValue: Math.round(gymWeekly * 10) / 10,
    projected3Month: Math.round(gymWeekly * 13),
    projected6Month: Math.round(gymWeekly * 26),
    projected1Year: Math.round(gymWeekly * 52),
    unit: "sessions/wk",
    confidence: recentGym.length >= 10 ? 75 : recentGym.length >= 5 ? 50 : 30,
    trend: gymWeekly >= 3 ? "improving" : gymWeekly < 1 ? "declining" : "stable",
    risk: gymWeekly < 2 ? "Current pace yields &lt;100 sessions/year" : null,
    opportunity: gymWeekly >= 3 ? "On track for 150+ sessions/year — excellent" : "Increasing to 3x/week unlocks significant health gains",
  })
  if (gymWeekly < 2) risks.push("Gym frequency below recommended minimum (3x/week)")
  if (gymWeekly >= 3) opportunities.push("Strong gym consistency — maintain for long-term health compounding")

  // Sleep projections
  const sleepLog = loadJSON("sleep_log") || {}
  const sleepEntries = Object.values(sleepLog as Record<string, { date: string; hours: string }>).filter(e => e?.date && new Date(e.date).getTime() > now - 90 * day)
  const avgSleep = sleepEntries.length > 0 ? sleepEntries.reduce((a: number, e) => a + (parseFloat(e.hours) || 0), 0) / sleepEntries.length : 0
  const sleepFirstHalf = sleepEntries.slice(0, Math.floor(sleepEntries.length / 2))
  const sleepSecondHalf = sleepEntries.slice(Math.floor(sleepEntries.length / 2))
  const firstAvg = sleepFirstHalf.length ? sleepFirstHalf.reduce((a: number, e) => a + (parseFloat(e.hours) || 0), 0) / sleepFirstHalf.length : 0
  const secondAvg = sleepSecondHalf.length ? sleepSecondHalf.reduce((a: number, e) => a + (parseFloat(e.hours) || 0), 0) / sleepSecondHalf.length : 0
  projections.push({
    metric: "Average Sleep",
    category: "health",
    currentValue: Math.round(avgSleep * 10) / 10,
    projected3Month: Math.round((avgSleep + (secondAvg - firstAvg) * 0.5) * 10) / 10,
    projected6Month: Math.round((avgSleep + (secondAvg - firstAvg)) * 10) / 10,
    projected1Year: Math.round((avgSleep + (secondAvg - firstAvg) * 2) * 10) / 10,
    unit: "hours",
    confidence: sleepEntries.length >= 20 ? 80 : sleepEntries.length >= 10 ? 60 : 40,
    trend: secondAvg > firstAvg ? "improving" : secondAvg < firstAvg ? "declining" : "stable",
    risk: avgSleep < 7 ? "Chronic sleep debt impacts cognitive performance, recovery, and mood" : null,
    opportunity: avgSleep >= 7 ? "Optimal sleep — all other metrics benefit" : "Improving to 7-8h could boost productivity 15-20%",
  })
  if (avgSleep < 7) risks.push("Sleep below 7h average — prioritize rest for better performance across all areas")
  if (avgSleep >= 7) opportunities.push("Excellent sleep habits — this is your strongest health foundation")

  // Habit projections
  const habits: Habit[] = loadJSON("lifeos_habits") || []
  const activeHabits = habits.filter((h: Habit) => (h.logs || []).length > 0)
  const avgStreak = activeHabits.length > 0 ? activeHabits.reduce((a: number, h: Habit) => a + (h.streak || 0), 0) / activeHabits.length : 0
  const recentHabitDays = activeHabits.filter(h => (h.logs || []).filter((d: string) => new Date(d).getTime() > now - 14 * day).length >= 10).length
  projections.push({
    metric: "Habit Consistency",
    category: "habits",
    currentValue: Math.round(avgStreak * 10) / 10,
    projected3Month: Math.round((avgStreak + recentHabitDays) * 3),
    projected6Month: Math.round((avgStreak + recentHabitDays) * 6),
    projected1Year: Math.round((avgStreak + recentHabitDays) * 12),
    unit: "day streak",
    confidence: activeHabits.length >= 3 ? 70 : 40,
    trend: recentHabitDays >= activeHabits.length / 2 ? "improving" : recentHabitDays > 0 ? "stable" : "declining",
    risk: avgStreak < 3 ? "Habits not yet automatic — high risk of dropping them" : null,
    opportunity: avgStreak >= 7 ? "Habits becoming automatic — compound effect starting" : "Focus on 7-day streaks to make habits stick",
  })
  if (activeHabits.length === 0) risks.push("No habits tracked yet — habits are the foundation of long-term growth")
  if (avgStreak >= 7) opportunities.push("Habits are sticking — this is where compound growth happens")

  // Mood projections
  const journal = loadJSON("lifeos_journal") || []
  const entries: JournalEntry[] = Array.isArray(journal) ? journal : []
  const recentMoods = entries.filter(e => e.createdAt > now - 90 * day)
  const goodMoods = recentMoods.filter(e => e.mood === "great" || e.mood === "good").length
  const moodRate = recentMoods.length > 0 ? Math.round(goodMoods / recentMoods.length * 100) : 0
  projections.push({
    metric: "Positive Mood Rate",
    category: "mental",
    currentValue: moodRate,
    projected3Month: Math.min(100, moodRate + 5),
    projected6Month: Math.min(100, moodRate + 10),
    projected1Year: Math.min(100, moodRate + 15),
    unit: "%",
    confidence: recentMoods.length >= 20 ? 75 : recentMoods.length >= 10 ? 55 : 35,
    trend: moodRate >= 70 ? "improving" : moodRate >= 40 ? "stable" : "declining",
    risk: moodRate < 50 ? "Below 50% positivity — consider a wellbeing check-in" : null,
    opportunity: moodRate >= 70 ? "Strong mental state — great time to tackle ambitious goals" : "Journaling more helps identify mood patterns",
  })
  if (moodRate > 0 && moodRate < 50) risks.push("Mood positivity rate below 50% — consider mindfulness or social connection")
  if (moodRate >= 70) opportunities.push("Excellent mood stability — your foundation is strong for challenging work")

  // Goal completion projection
  let totalGoals = 0
  let doneGoals = 0
  for (let i = 0; i < 30; i++) {
    const d = new Date(now - i * day).toISOString().slice(0, 10)
    const g: Goal[] = loadJSON(`goals:${d}`) || []
    totalGoals += g.length
    doneGoals += g.filter(x => x.done).length
  }
  const goalRate = totalGoals > 0 ? Math.round(doneGoals / totalGoals * 100) : 0
  projections.push({
    metric: "Goal Completion Rate",
    category: "productivity",
    currentValue: goalRate,
    projected3Month: Math.min(100, goalRate + Math.round((100 - goalRate) * 0.1)),
    projected6Month: Math.min(100, goalRate + Math.round((100 - goalRate) * 0.2)),
    projected1Year: Math.min(100, goalRate + Math.round((100 - goalRate) * 0.35)),
    unit: "%",
    confidence: totalGoals >= 30 ? 80 : totalGoals >= 15 ? 60 : 40,
    trend: goalRate >= 70 ? "improving" : goalRate >= 40 ? "stable" : "declining",
    risk: goalRate < 50 ? "Setting too many goals — consider reducing scope" : null,
    opportunity: goalRate >= 70 ? "Strong execution — you consistently follow through" : "Focus on 3 key goals daily for higher completion",
  })
  if (goalRate < 50) risks.push("Goal completion below 50% — reduce daily goal count or break into smaller tasks")
  if (goalRate >= 70) opportunities.push("Goal completion rate is strong — you're reliable and consistent")

  // Water projection
  const health = loadJSON("health_dashboard_v1")
  const avgWater = health?.waterMl || 0
  projections.push({
    metric: "Daily Water Intake",
    category: "health",
    currentValue: avgWater,
    projected3Month: Math.min(3000, avgWater + 200),
    projected6Month: Math.min(3000, avgWater + 350),
    projected1Year: Math.min(3000, avgWater + 500),
    unit: "ml",
    confidence: health ? 60 : 20,
    trend: avgWater >= 1500 ? "stable" : "declining",
    risk: avgWater < 1000 ? "Chronic dehydration affects energy, focus, and health" : null,
    opportunity: avgWater >= 2000 ? "Optimal hydration — maintaining well" : "2L/day target boosts energy and cognitive performance",
  })
  if (avgWater < 1000) risks.push("Water intake below 1000ml — dehydration impacts all body systems")
  if (avgWater >= 2000) opportunities.push("Excellent hydration — this supports every other metric")

  const summary = `Current trajectory shows ${projections.filter(p => p.trend === "improving").length} improving, ${projections.filter(p => p.trend === "stable").length} stable, and ${projections.filter(p => p.trend === "declining").length} declining areas.`
  const improving = projections.filter(p => p.trend === "improving").length
  const declining = projections.filter(p => p.trend === "declining").length
  const overallAssessment = declining > improving
    ? "Several metrics need attention. Focus on sleep and habits first — they have the highest leverage on everything else."
    : improving >= declining
    ? "Positive trajectory overall. Your current habits are building momentum — keep going."
    : "Mixed signals. Your improving areas are strong; focus energy on the declining ones."

  return { projections, summary, overallAssessment, risks, opportunities, generatedAt: Date.now() }
}

export function estimateBodyMetrics(currentWeight: number | null): { weight: number | null } {
  return { weight: currentWeight }
}
