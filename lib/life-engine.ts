"use client"

import type { Goal, GymState, Habit } from "./types"
import type { StudyTask } from "./study-types"

export interface LifeScoreBreakdown {
  health: number
  fitness: number
  learning: number
  projects: number
  wealth: number
  habits: number
}

export interface DailyBriefing {
  greeting: string
  timeOfDay: "morning" | "afternoon" | "evening"
  insights: string[]
  recommendations: string[]
  focusOfDay: string
  recovery: { direction: "up" | "down" | "stable"; value: string }
  projectVelocity: { direction: "up" | "down" | "stable"; value: string }
  learningProgress: { direction: "up" | "down" | "stable"; value: string }
}

export interface WeeklyReview {
  wins: string[]
  losses: string[]
  progress: string[]
  risks: string[]
  recommendations: string[]
  weekScore: number
}

export interface MonthlyReport {
  growth: string[]
  goalAlignment: number
  consistency: number
  healthTrends: string[]
  learningTrends: string[]
}

export function getTimeOfDay(): "morning" | "afternoon" | "evening" {
  const hour = new Date().getHours()
  if (hour < 12) return "morning"
  if (hour < 17) return "afternoon"
  return "evening"
}

export function generateGreeting(username = "Akshat"): string {
  const tod = getTimeOfDay()
  const greetings: Record<string, string> = {
    morning: "Good Morning",
    afternoon: "Good Afternoon",
    evening: "Good Evening",
  }
  return `${greetings[tod]}, ${username}`
}

export function calculateLifeScore(data: {
  waterMl: number
  sleepMinutes: number
  gymLogs: number
  tasksDone: number
  tasksTotal: number
  studyScores: number[]
  supplementsDone: number
  supplementsTotal: number
}): { score: number; breakdown: LifeScoreBreakdown } {
  const healthScore = Math.min(100, Math.round(
    (data.waterMl / 2000) * 40 +
    (data.sleepMinutes / 480) * 40 +
    (data.supplementsTotal > 0 ? (data.supplementsDone / data.supplementsTotal) * 20 : 10)
  ))

  const fitnessScore = Math.min(100, Math.round(
    Math.min(data.gymLogs, 7) / 7 * 100
  ))

  const learningScore = data.studyScores.length > 0
    ? Math.round(data.studyScores.reduce((a, b) => a + b, 0) / data.studyScores.length)
    : 0

  const projectsScore = data.tasksTotal > 0
    ? Math.round((data.tasksDone / data.tasksTotal) * 100)
    : 0

  const wealthScore = 50 // placeholder — stock data integration
  const habitsScore = Math.round((healthScore + fitnessScore + learningScore) / 3)

  const overall = Math.round(
    healthScore * 0.25 +
    fitnessScore * 0.2 +
    learningScore * 0.2 +
    projectsScore * 0.15 +
    wealthScore * 0.1 +
    habitsScore * 0.1
  )

  return {
    score: overall,
    breakdown: { health: healthScore, fitness: fitnessScore, learning: learningScore, projects: projectsScore, wealth: wealthScore, habits: habitsScore },
  }
}

export function generateBriefing(prevBriefing?: DailyBriefing): DailyBriefing {
  const tod = getTimeOfDay()
  const isMorning = tod === "morning"
  const today = new Date().toISOString().slice(0, 10)

  // Real data from localStorage
  let goalsTotal = 0, goalsDone = 0, goalsYesterdayTotal = 0, goalsYesterdayDone = 0
  let waterPct = 0, gymSessions = 0, studyDone = 0, studyTotal = 0
  let sleepHours = 8, habitDone = 0, habitTotal = 0

  try {
    const g: Goal[] = JSON.parse(localStorage.getItem("goals:" + today) || "[]")
    goalsTotal = g.length; goalsDone = g.filter(x => x.done).length
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
    const gy: Goal[] = JSON.parse(localStorage.getItem("goals:" + yesterday) || "[]")
    goalsYesterdayTotal = gy.length; goalsYesterdayDone = gy.filter(x => x.done).length
  } catch {}

  try {
    const h = JSON.parse(localStorage.getItem("health_dashboard_v1") || "{}")
    waterPct = Math.min(100, Math.round((h.waterMl || 0) / 2000 * 100))
  } catch {}

  try {
    const g: GymState = JSON.parse(localStorage.getItem("gym_dashboard_v1") || "{}")
    if (g.logs) {
      const weekAgo = Date.now() - 7 * 86400000
      gymSessions = new Set(g.logs.filter(l => l.at >= weekAgo).map(l => new Date(l.at).toISOString().slice(0, 10))).size
    }
  } catch {}

  try {
    const s: StudyTask[] = JSON.parse(localStorage.getItem("study_tasks_v1") || "[]")
    studyTotal = s.length; studyDone = s.filter(x => x.done).length
  } catch {}

  try {
    const sh = JSON.parse(localStorage.getItem("last_sleep_hours") || "8")
    sleepHours = typeof sh === "number" ? sh : 8
  } catch {}

  try {
    const hb: Habit[] = JSON.parse(localStorage.getItem("lifeos_habits") || "[]")
    habitTotal = hb.length; habitDone = hb.filter(x => x.logs?.includes(today)).length
  } catch {}

  const goalCompletion = goalsTotal > 0 ? Math.round(goalsDone / goalsTotal * 100) : 0
  const yesterdayCompletion = goalsYesterdayTotal > 0 ? Math.round(goalsYesterdayDone / goalsYesterdayTotal * 100) : 0
  const goalTrend = yesterdayCompletion > 0 && goalCompletion > yesterdayCompletion ? "up" : goalCompletion < yesterdayCompletion ? "down" : "stable"
  const sleepGood = sleepHours >= 7
  const healthGood = waterPct >= 75
  const gymTarget = gymSessions >= 3 ? "on track" : "needs focus"
  const studyActive = studyTotal > 0

  const insights: string[] = []
  const recommendations: string[] = []

  if (isMorning) {
    if (goalCompletion > 0) insights.push(`Goal completion at ${goalCompletion}% — ${goalTrend === "up" ? "improving" : goalTrend === "down" ? "slipping" : "steady"} from yesterday.`)
    else insights.push("No goals set yet — define today's priorities to stay on track.")
    if (sleepGood) insights.push(`Sleep at ${sleepHours}h — recovery is solid.`)
    else insights.push(`Sleep at ${sleepHours}h — below the 8h target. Prioritize rest tonight.`)
    if (gymSessions < 3) insights.push(`Gym: ${gymSessions}/3 sessions this week — ${gymSessions === 0 ? "start with a session today." : "schedule the remaining sessions."}`)
    else insights.push(`Gym: ${gymSessions} sessions this week — great consistency.`)
    if (habitDone > 0) insights.push(`Habits: ${habitDone}/${habitTotal} done today.`)
    if (healthGood) insights.push(`Hydration at ${waterPct}% — well hydrated.`)
    else if (waterPct < 50) insights.push(`Hydration at ${waterPct}% — drink 2 glasses now.`)
    if (studyActive) insights.push(`Study: ${studyDone}/${studyTotal} tasks complete.`)
    recommendations.push(focusOfDay(), "Review your top 3 priorities for today.", "Log your meals and supplements.")
  } else {
    if (goalCompletion >= 80) insights.push(`Excellent day — ${goalsDone}/${goalsTotal} goals completed.`)
    else if (goalCompletion >= 50) insights.push(`Good progress — ${goalsDone}/${goalsTotal} goals done. Finish the rest.`)
    else insights.push(`Only ${goalsDone}/${goalsTotal} goals done — push through the remaining tasks.`)
    if (!sleepGood) insights.push("Prioritize sleep tonight for better recovery.")
    if (habitDone < habitTotal) insights.push(`Habits: ${habitDone}/${habitTotal} — complete the remaining.`)
    insights.push(waterPct < 50 ? "Hydration is low — catch up on water before bed." : "Hydration levels are good.")
    recommendations.push("Review what you accomplished today.", "Plan tomorrow's top 3 priorities.", habitDone < habitTotal ? "Finish remaining habits." : "Wind down with a reflective journal entry.")
  }

  return {
    greeting: generateGreeting(),
    timeOfDay: tod,
    insights,
    recommendations,
    focusOfDay: focusOfDay(),
    recovery: { direction: sleepGood ? "up" : "down", value: sleepHours >= 7 ? `${sleepHours}h` : `${8 - sleepHours}h deficit` },
    projectVelocity: { direction: goalTrend as "up" | "down" | "stable", value: goalsTotal > 0 ? `${goalCompletion}%` : "N/A" },
    learningProgress: { direction: studyActive ? "up" : "stable", value: studyActive ? `${studyDone}/${studyTotal}` : "no data" },
  }
}

function focusOfDay(): string {
  try {
    const tasks: StudyTask[] = JSON.parse(localStorage.getItem("study_tasks_v1") || "[]")
    const undone = tasks.filter(t => !t.done)
    if (undone.length > 0) return `Complete ${undone[0].text || "pending task"}`
    const goals: Goal[] = JSON.parse(localStorage.getItem("goals:" + new Date().toISOString().slice(0, 10)) || "[]")
    const undoneGoals = goals.filter(g => !g.done)
    if (undoneGoals.length > 0) return `Complete "${undoneGoals[0].text}"`
    return "Plan your next priority"
  } catch {
    return "Set today's top priority"
  }
}

export function generateWeeklyReview(data: {
  completedTasks: number
  totalTasks: number
  avgLifeScore: number
  gymSessions: number
  studyHours: number
}): WeeklyReview {
  const completionRate = data.totalTasks > 0 ? Math.round(data.completedTasks / data.totalTasks * 100) : 0
  return {
    wins: [
      `Completed ${data.completedTasks}/${data.totalTasks} tasks (${completionRate}%)`,
      `Hit the gym ${data.gymSessions} times this week`,
      `Average Life Score: ${data.avgLifeScore}/100`,
    ],
    losses: data.studyHours < 5 ? ["Study time below target this week"] : [],
    progress: [
      `Overall task completion trending ${completionRate > 70 ? "upward" : "stable"}`,
      data.gymSessions >= 3 ? "Gym consistency maintained" : "Gym attendance needs focus",
    ],
    risks: data.avgLifeScore < 60 ? ["Life Score trending down — check health and recovery"] : [],
    recommendations: [
      data.studyHours < 5 ? "Block 2-hour study sessions daily" : "Continue current study rhythm",
      data.gymSessions < 3 ? "Schedule minimum 3 gym sessions next week" : "Maintain gym consistency",
    ],
    weekScore: data.avgLifeScore,
  }
}

export function computeMomentum(): { daily: number; weekly: number; monthly: number } {
  const data = typeof window !== "undefined" ? localStorage : null
  if (!data) return { daily: 0, weekly: 0, monthly: 0 }

  try {
    const goalsToday: Goal[] = JSON.parse(data.getItem("goals:" + new Date().toISOString().slice(0, 10)) || "[]")
    const total = goalsToday.length
    const done = goalsToday.filter(g => g.done).length
    const daily = total > 0 ? Math.round(done / total * 100) : 0

    // Weekly: last 7 days
    let weeklyTotal = 0
    let weeklyDone = 0
    for (let i = 0; i < 7; i++) {
      const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10)
      try {
        const dayGoals: Goal[] = JSON.parse(data.getItem("goals:" + d) || "[]")
        weeklyTotal += dayGoals.length
        weeklyDone += dayGoals.filter(g => g.done).length
      } catch {}
    }
    const weekly = weeklyTotal > 0 ? Math.round(weeklyDone / weeklyTotal * 100) : 0

    // Monthly: simplified from tracked projects
    const monthly = Math.round((daily + weekly) / 2)

    return { daily, weekly, monthly }
  } catch {
    return { daily: 0, weekly: 0, monthly: 0 }
  }
}
