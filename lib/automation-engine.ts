"use client"

import type { Goal, Habit, Chapter, Idea, GymState } from "./types"
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

export async function generateStudyPlan(): Promise<AutomationResult> {
  const chapters = loadJSON<Chapter[]>("lifeos_chapters")
  if (!chapters || !Array.isArray(chapters) || chapters.length === 0) {
    return { success: true, message: "No chapters found. Add chapters to Learning OS first, then run again.", data: { plan: null } }
  }

  const today = new Date().toISOString().slice(0, 10)
  const goals = loadJSON<Goal[]>(`goals:${today}`) || []
  const habits = loadJSON<Habit[]>("lifeos_habits") || []
  const gymData = loadJSON<GymState>("gym_dashboard_v1")

  const contextParts: string[] = []
  if (goals.length > 0) contextParts.push(`Today's goals: ${goals.filter(g => !g.done).map(g => g.text).join(", ")}`)
  if (habits.length > 0) contextParts.push(`Habits to log today: ${habits.filter(h => !h.logs?.includes(today)).map(h => h.name).join(", ")}`)
  if (gymData?.logs) {
    const gymWeek = gymData.logs.filter(l => l.at > Date.now() - 7 * 86400000).length
    contextParts.push(`Gym sessions this week: ${gymWeek}`)
  }

  try {
    const res = await fetch("/api/jarvis/study-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chapters, context: contextParts.join(". ") }),
    })
    if (!res.ok) throw new Error(`API error ${res.status}`)
    const json = await res.json()
    if (json.error) throw new Error(json.error)
    if (json.allDone) {
      return { success: true, message: `All ${chapters.length} chapters completed! Great work. Add new chapters to keep going.`, data: { plan: null, allDone: true } }
    }
    if (!json.plan) {
      return { success: true, message: json.message || "Study plan generated.", data: { raw: json.raw } }
    }
    return { success: true, message: "", data: json.plan }
  } catch (err) {
    return { success: true, message: `AI study plan unavailable. Using offline plan: ${fallbackStudyPlan(chapters)}`, data: { fallback: true } }
  }
}

function fallbackStudyPlan(chapters: Chapter[]): string {
  const incomplete = chapters.filter(c => !c.completed)
  const bySubject: Record<string, number> = {}
  incomplete.forEach(c => {
    bySubject[c.subject] = (bySubject[c.subject] || 0) + 1
  })
  return Object.entries(bySubject).map(([s, n]) => `${s}: ${n} chapters left`).join(" · ")
}

export function generateWorkoutRoutine(): AutomationResult {
  const gymData = loadJSON<GymState>("gym_dashboard_v1")
  const logs = gymData?.logs || []
  if (logs.length === 0) {
    return { success: true, message: "No workout data yet. Log your first gym session, then run again for a personalized routine.", data: { focus: "full-body", weeklyAvg: 0, totalLogs: 0 } }
  }
  const recentSplits = [...new Set(logs.slice(-10).map(l => l.split || "unknown"))]
  const focus = recentSplits.length > 0 ? recentSplits[0] : "full-body"
  const weeklyAvg = (logs.length / 4).toFixed(1)
  const suggestion = focus === "full-body" ? "Try a Push/Pull/Legs split to target specific muscle groups." : `Your recent focus has been "${focus}". Consider alternating with a different split for balanced development.`
  return {
    success: true,
    message: `Routine: Focus on ${focus} (${logs.length} total logs, ~${weeklyAvg}/week). ${suggestion}`,
    data: { focus, weeklyAvg: Number(weeklyAvg), totalLogs: logs.length, splits: recentSplits },
  }
}

export function createDailySchedule(): AutomationResult {
  const today = new Date().toISOString().slice(0, 10)
  const goals = loadJSON<Goal[]>(`goals:${today}`) || []
  const pending = goals.filter(g => !g.done)
  const habits = loadJSON<Habit[]>("lifeos_habits") || []
  const undoneHabits = habits.filter(h => !h.logs?.includes(today))

  const lines: string[] = []
  if (pending.length > 0) {
    lines.push(`Goals (${pending.length} pending):`)
    pending.forEach((g, i) => lines.push(`  ${i + 1}. ${g.text}${g.priority ? ` [${g.priority}]` : ""}`))
  } else {
    lines.push("Goals: None set for today. Add at least one goal to start.")
  }
  if (undoneHabits.length > 0) {
    lines.push(`Habits (${undoneHabits.length} to do): ${undoneHabits.map(h => h.name).join(", ")}`)
  } else if (habits.length > 0) {
    lines.push("Habits: All done for today!")
  }
  const totalTasks = pending.length + undoneHabits.length
  const estimate = totalTasks > 0 ? `Estimated: ${totalTasks * 15}-${totalTasks * 30} min` : ""

  return {
    success: true,
    message: [...lines, estimate].filter(Boolean).join("\n"),
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
    const g: Goal[] = loadJSON(`goals:${d}`) || []
    totalGoals += g.length
    doneGoals += g.filter(x => x.done).length
  }
  const rate = totalGoals > 0 ? Math.round(doneGoals / totalGoals * 100) : 0
  const gymData: GymState | null = loadJSON("gym_dashboard_v1")
  const gymWeek = (gymData?.logs || []).filter(l => l.at > now - 7 * day).length
  const habits = loadJSON<Habit[]>("lifeos_habits") || []
  const habitDays = habits.filter(h => (h.logs || []).filter(d => new Date(d + "T12:00:00").getTime() > now - 7 * day).length >= 4).length

  const highlights: string[] = []
  if (totalGoals === 0 && gymWeek === 0) {
    return { success: true, message: "No data this week. Start tracking goals, gym, and habits to get a weekly review.", data: { goalRate: 0, gymSessions: 0 } }
  }
  if (totalGoals > 0) highlights.push(`Goals: ${doneGoals}/${totalGoals} (${rate}%)`)
  if (gymWeek > 0) highlights.push(`Gym: ${gymWeek} sessions`)
  if (habits.length > 0) highlights.push(`Habits: ${habitDays}/${habits.length} habits on track`)
  highlights.push(rate >= 70 ? "Great consistency!" : rate > 0 ? "Room for improvement — try setting fewer but achievable daily goals." : "")

  return {
    success: true,
    message: highlights.filter(Boolean).join(" · "),
    data: { goalRate: rate, gymSessions: gymWeek, habitsOnTrack: habitDays },
  }
}

export function organizeNotes(): AutomationResult {
  const docs = loadJSON<Idea[]>("lifeos_brain")
  const ideas = Array.isArray(docs) ? docs : []
  if (ideas.length === 0) {
    return { success: true, message: "No notes yet. Add ideas to your Second Brain on the Brain page, then run again.", data: { total: 0, tagged: 0, untagged: 0 } }
  }
  const tagged = ideas.filter(i => (i.tags || []).length > 0)
  const untagged = ideas.filter(i => (i.tags || []).length === 0)
  const maxConnections = Math.max(0, ...ideas.map(i => (i.connections || []).length))
  const mostConnected = ideas.find(i => (i.connections || []).length === maxConnections)

  const tips: string[] = []
  if (untagged.length > 0) tips.push(`${untagged.length} ideas need tags — add tags to improve searchability.`)
  if (maxConnections === 0 && ideas.length > 1) tips.push("No connections between ideas yet — link related notes on the Brain page.")
  if (mostConnected && maxConnections > 0) tips.push(`"${mostConnected.title}" is your most connected idea (${maxConnections} links).`)

  return {
    success: true,
    message: `${ideas.length} notes: ${tagged.length} tagged, ${untagged.length} untagged. ${tips.join(" ")}`,
    data: { total: ideas.length, tagged: tagged.length, untagged: untagged.length, mostConnected: mostConnected?.title || null },
  }
}

export function recommendPriorities(): AutomationResult {
  const today = new Date().toISOString().slice(0, 10)
  const goals = loadJSON<Goal[]>(`goals:${today}`) || []
  const pending = goals.filter(g => !g.done).slice(0, 3)
  const habits = loadJSON<Habit[]>("lifeos_habits") || []
  const undoneHabits = habits.filter(h => !h.logs?.includes(today))
  const gymData: GymState | null = loadJSON("gym_dashboard_v1")
  const gymToday = (gymData?.logs || []).filter(l => new Date(l.at).toISOString().slice(0, 10) === today).length === 0
  const health = loadJSON("health_dashboard_v1")
  const needsWater = (health?.waterMl || 0) < 1000

  const recommendations: string[] = []
  if (goals.length === 0) recommendations.push("Set at least one goal for today to create momentum.")
  else if (pending.length === 0) recommendations.push("All goals done — add more or take the win!")
  else recommendations.push(`Finish top goal: "${pending[0].text}"${pending[0].priority ? ` (${pending[0].priority} priority)` : ""}`)

  if (undoneHabits.length > 0) recommendations.push(`Complete habits: ${undoneHabits.slice(0, 3).map(h => h.name).join(", ")}`)
  if (gymToday && pending.length <= 2) recommendations.push("Schedule today's gym session — it's a good rest from cognitive work.")
  if (needsWater) recommendations.push("Drink 2 glasses of water now — hydration directly affects focus.")
  if (recommendations.length === 1) recommendations.push("Review your Learning OS for any due chapters or upcoming exams.")

  return {
    success: true,
    message: recommendations.join(". "),
    data: { recommendations, hasPendingGoals: pending.length > 0, needsGym: gymToday, needsWater },
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