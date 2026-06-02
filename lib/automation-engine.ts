"use client"

import { useStore } from "./store"
import { loadJSON, saveJSON } from "./utils"

export interface AutomationAction {
  id: string
  name: string
  description: string
  type: "plan" | "schedule" | "generate" | "organize" | "recommend"
  execute: () => AutomationResult | Promise<AutomationResult>
}

export interface AutomationResult {
  success: boolean
  message: string
  data?: any
}

export function generateStudyPlan(): AutomationResult {
  const chapters = loadJSON("lifeos_chapters") || []
  const incomplete = Array.isArray(chapters) ? chapters.filter((c: any) => !c.completed) : []
  const bySubject: Record<string, any[]> = {}
  incomplete.forEach((c: any) => {
    if (!bySubject[c.subject]) bySubject[c.subject] = []
    bySubject[c.subject].push(c)
  })
  const plan = Object.entries(bySubject).map(([subject, chs]) => {
    return {
      subject,
      remaining: chs.length,
      estimate: `${chs.length * 2}-${chs.length * 4} hours`,
      chapters: chs.map((c: any) => c.name),
    }
  })
  return {
    success: true,
    message: `Study plan generated: ${plan.map(p => `${p.subject}: ${p.remaining} chapters (${p.estimate})`).join(", ")}`,
    data: plan,
  }
}

export function generateWorkoutRoutine(): AutomationResult {
  const gymData = loadJSON("gym_dashboard_v1")
  const logs: any[] = gymData?.logs || []
  const recentSplits = [...new Set(logs.slice(-10).map((l: any) => l.split || "unknown"))]
  const focus = recentSplits.length > 0 ? recentSplits[0] : "full-body"
  return {
    success: true,
    message: `Workout routine generated with focus on ${focus}. Current weekly avg: ${(logs.length / 4).toFixed(1)} sessions.`,
    data: { focus, weeklyAvg: logs.length / 4 },
  }
}

export function createDailySchedule(): AutomationResult {
  const today = new Date().toISOString().slice(0, 10)
  const goals = loadJSON(`goals:${today}`) || []
  const pending = goals.filter((g: any) => !g.done)
  const habits = loadJSON("lifeos_habits") || []
  const undoneHabits = habits.filter((h: any) => !h.logs?.includes(today))
  return {
    success: true,
    message: `Schedule created with ${pending.length} pending goals and ${undoneHabits.length} habits to complete.`,
    data: { pendingGoals: pending.length, pendingHabits: undoneHabits.length },
  }
}

export function generateWeeklyReview(): AutomationResult {
  const now = Date.now()
  const day = 86400000
  let totalGoals = 0
  let doneGoals = 0
  for (let i = 0; i < 7; i++) {
    const d = new Date(now - i * day).toISOString().slice(0, 10)
    const g = loadJSON(`goals:${d}`) || []
    totalGoals += g.length
    doneGoals += g.filter((x: any) => x.done).length
  }
  const rate = totalGoals > 0 ? Math.round(doneGoals / totalGoals * 100) : 0
  const gymData = loadJSON("gym_dashboard_v1")
  const gymWeek = (gymData?.logs || []).filter((l: any) => new Date(l.date).getTime() > now - 7 * day).length

  return {
    success: true,
    message: `Weekly review: ${rate}% goals completed, ${gymWeek} gym sessions. ${rate >= 70 ? "Great week!" : "Room for improvement."}`,
    data: { goalRate: rate, gymSessions: gymWeek },
  }
}

export function organizeNotes(): AutomationResult {
  const docs = loadJSON("lifeos_brain") || []
  const ideas = Array.isArray(docs) ? docs : []
  const tagged = ideas.filter((i: any) => (i.tags || []).length > 0)
  const untagged = ideas.filter((i: any) => (i.tags || []).length === 0)
  return {
    success: true,
    message: `Organized ${ideas.length} notes: ${tagged.length} tagged, ${untagged.length} need tags.`,
    data: { total: ideas.length, tagged: tagged.length, untagged: untagged.length },
  }
}

export function recommendPriorities(): AutomationResult {
  const now = Date.now()
  const today = new Date().toISOString().slice(0, 10)
  const goals = loadJSON(`goals:${today}`) || []
  const pending = goals.filter((g: any) => !g.done).slice(0, 3)
  const habits = loadJSON("lifeos_habits") || []
  const undoneHabits = habits.filter((h: any) => !h.logs?.includes(today))
  const gymData = loadJSON("gym_dashboard_v1")
  const gymToday = (gymData?.logs || []).filter((l: any) => l.date === today).length === 0
  const health = loadJSON("health_dashboard_v1")
  const needsWater = (health?.waterMl || 0) < 1000

  const recommendations: string[] = []
  if (pending.length > 0) recommendations.push(`Complete top goal: "${pending[0].text}"`)
  else recommendations.push("Set goals for today")
  if (undoneHabits.length > 0) recommendations.push(`Complete habits: ${undoneHabits.slice(0, 3).map((h: any) => h.name).join(", ")}`)
  if (gymToday) recommendations.push("Schedule today's gym session")
  if (needsWater) recommendations.push("Drink more water throughout the day")

  return {
    success: true,
    message: recommendations.join(". "),
    data: { recommendations },
  }
}

export function getAutomations(): AutomationAction[] {
  return [
    {
      id: "study_plan",
      name: "Generate Study Plan",
      description: "Create a revision schedule based on incomplete chapters",
      type: "plan",
      execute: generateStudyPlan,
    },
    {
      id: "workout_routine",
      name: "Generate Workout Routine",
      description: "Create a workout plan based on your gym history",
      type: "generate",
      execute: generateWorkoutRoutine,
    },
    {
      id: "daily_schedule",
      name: "Create Daily Schedule",
      description: "Organize today's goals and habits into a schedule",
      type: "schedule",
      execute: createDailySchedule,
    },
    {
      id: "weekly_review",
      name: "Generate Weekly Review",
      description: "Auto-generate a summary of your week",
      type: "generate",
      execute: generateWeeklyReview,
    },
    {
      id: "organize_notes",
      name: "Organize Notes",
      description: "Review and organize your knowledge graph ideas",
      type: "organize",
      execute: organizeNotes,
    },
    {
      id: "recommend_priorities",
      name: "Recommend Priorities",
      description: "Get AI-suggested priorities for today",
      type: "recommend",
      execute: recommendPriorities,
    },
  ]
}
