"use client"

import type { Goal, HealthState, GymState, Habit, Decision, Mission, JournalEntry, Chapter, TrackedProject } from "./types"
import type { StudyTask, StudyScore } from "./study-types"

export interface JarvisContext {
  page: string
  goals: { total: number; done: number }
  health: { waterPct: number; supplementsDone: number; supplementsTotal: number }
  gym: { sessionsThisWeek: number; lastSession: string | null }
  sleep: { hours: number; timerActive: boolean }
  study: { tasksDone: number; tasksTotal: number; avgScore: number; weakTopics: string[]; revisionCycle: string | null }
  stocks: { holdingsCount: number; totalValue: number; totalReturn: number }
  projects: { activeProject: string | null; trackedCount: number }
  habits: { total: number; doneToday: number; longestStreak: number }
  decisions: { totalDecisions: number; positiveOutcomes: number; recentDecision: string | null }
  memories: { total: number; recentMemories: string[]; topCategories: string[] }
  missions: { total: number; completed: number; activeCount: number }
  journal: { totalEntries: number; recentMood: string | null }
  timeOfDay: "morning" | "afternoon" | "evening"
  dayOfWeek: number
}

export interface JarvisInsight {
  message: string
  type: "positive" | "negative" | "neutral" | "action"
  metric?: string
}

export function gatherContext(page: string): JarvisContext {
  const today = new Date().toISOString().slice(0, 10)
  const hour = new Date().getHours()
  const timeOfDay = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening"

  let goals = { total: 0, done: 0 }
  try {
    const g: Goal[] = JSON.parse(localStorage.getItem("goals:" + today) || "[]")
    goals = { total: g.length, done: g.filter(x => x.done).length }
  } catch {}

  let health = { waterPct: 0, supplementsDone: 0, supplementsTotal: 0 }
  try {
    const h: HealthState = JSON.parse(localStorage.getItem("health_dashboard_v1") || "{}")
    health = {
      waterPct: Math.min(100, Math.round((h.waterMl || 0) / 2000 * 100)),
      supplementsDone: Object.values(h.done || {}).filter(Boolean).length,
      supplementsTotal: Math.max(Object.keys(h.done || {}).length, 1),
    }
  } catch {}

  let gym = { sessionsThisWeek: 0, lastSession: null as string | null }
  try {
    const g: GymState = JSON.parse(localStorage.getItem("gym_dashboard_v1") || "{}")
    if (g.logs) {
      const thisWeek = g.logs.filter(l => {
        const d = new Date(l.at).toISOString().slice(0, 10)
        const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10)
        return d >= weekAgo
      })
      gym = {
        sessionsThisWeek: new Set(thisWeek.map(l => new Date(l.at).toISOString().slice(0, 10))).size,
        lastSession: thisWeek.length > 0 ? new Date(thisWeek[thisWeek.length - 1].at).toISOString().slice(0, 10) : null,
      }
    }
  } catch {}

  const sleepTimer = localStorage.getItem("sleep_timer_start")
  let sleep = { hours: 8, timerActive: false }
  try {
    const s = JSON.parse(localStorage.getItem("last_sleep_hours") || "8")
    sleep = { hours: typeof s === "number" ? s : 8, timerActive: sleepTimer !== null && sleepTimer !== "null" }
  } catch {}

  let study = { tasksDone: 0, tasksTotal: 0, avgScore: 0 }
  try {
    const t: StudyTask[] = JSON.parse(localStorage.getItem("study_tasks_v1") || "[]")
    study.tasksTotal = t.length
    study.tasksDone = t.filter(x => x.done).length
    const scores: StudyScore[] = JSON.parse(localStorage.getItem("study_scores_v1") || "[]")
    if (scores.length > 0) {
      study.avgScore = Math.round(scores.reduce((a, s) => a + (s.score || 0) / (s.total || 1), 0) / scores.length * 100)
    }
  } catch {}

  let stocks = { holdingsCount: 0, totalValue: 0, totalReturn: 0 }
  try {
    const h = JSON.parse(localStorage.getItem("stocks_holdings_v1") || "[]")
    stocks.holdingsCount = h.length
  } catch {}

  let projects = { activeProject: null as string | null, trackedCount: 0 }
  try {
    const p: TrackedProject[] = JSON.parse(localStorage.getItem("tracked_projects") || "[]")
    projects = {
      activeProject: p.find(x => x.startTime != null)?.name || null,
      trackedCount: p.length,
    }
  } catch {}

  let habits = { total: 0, doneToday: 0, longestStreak: 0 }
  try {
    const h: Habit[] = JSON.parse(localStorage.getItem("lifeos_habits") || "[]")
    habits = {
      total: h.length,
      doneToday: h.filter(x => x.logs?.includes(today)).length,
      longestStreak: Math.max(0, ...h.map(x => x.streak || 0)),
    }
  } catch {}

  // Decisions context
  let decisions = { totalDecisions: 0, positiveOutcomes: 0, recentDecision: null as string | null }
  try {
    const d: Decision[] = JSON.parse(localStorage.getItem("lifeos_decisions") || "[]")
    decisions = {
      totalDecisions: d.length,
      positiveOutcomes: d.filter(x => x.outcome === "positive").length,
      recentDecision: d.length > 0 ? d[d.length - 1].title : null,
    }
  } catch {}

  // Memories context
  let memories = { total: 0, recentMemories: [] as string[], topCategories: [] as string[] }
  try {
    const m: { category?: string; text?: string; title?: string; content?: string }[] = JSON.parse(localStorage.getItem("lifeos_memory_engine") || "[]")
    const catCount: Record<string, number> = {}
    m.forEach(x => { if (x.category) catCount[x.category] = (catCount[x.category] || 0) + 1 })
    const topCat = Object.entries(catCount).sort((a, b) => b[1] - a[1]).slice(0, 3).map(e => e[0])
    memories = {
      total: m.length,
      recentMemories: m.slice(-3).map(x => x.text || x.title || x.content || ""),
      topCategories: topCat,
    }
  } catch {}

  // Missions context
  let missions = { total: 0, completed: 0, activeCount: 0 }
  try {
    const ms: Mission[] = JSON.parse(localStorage.getItem("lifeos_missions") || "[]")
    missions = {
      total: ms.length,
      completed: ms.filter(x => x.status === "completed").length,
      activeCount: ms.filter(x => x.status === "active").length,
    }
  } catch {}

  // Journal context
  let journal = { totalEntries: 0, recentMood: null as string | null }
  try {
    const j: JournalEntry[] = JSON.parse(localStorage.getItem("lifeos_journal") || "[]")
    journal = {
      totalEntries: j.length,
      recentMood: j.length > 0 ? j[j.length - 1].mood : null,
    }
  } catch {}

  // Study weak topics from scores
  let weakTopics: string[] = []
  try {
    const scores: StudyScore[] = JSON.parse(localStorage.getItem("study_scores_v1") || "[]")
    const weak = scores.filter(s => (s.score || 0) < ((s.total || 1) * 0.6))
    weakTopics = [...new Set(weak.map(s => s.subject || "").filter(Boolean)) as Set<string>].slice(0, 3)
  } catch {}

  // Revision cycle from study data
  let revisionCycle: string | null = null
  try {
    const tasks: StudyTask[] = JSON.parse(localStorage.getItem("study_tasks_v1") || "[]")
    const doneToday = tasks.filter(t => t.done)
    if (doneToday.length >= 3) revisionCycle = "active"
    else if (doneToday.length > 0) revisionCycle = "light"
    else revisionCycle = "rest"
  } catch {}

  return { page, goals, health, gym, sleep, study: { ...study, weakTopics, revisionCycle }, stocks, projects, habits, decisions, memories, missions, journal, timeOfDay, dayOfWeek: new Date().getDay() }
}

export function generatePageInsights(context: JarvisContext): JarvisInsight[] {
  const insights: JarvisInsight[] = []

  switch (context.page) {
    case "home":
      if (context.goals.total > 0 && context.goals.done === 0) {
        insights.push({ message: "No goals completed yet — start with your top priority.", type: "action" })
      } else if (context.goals.done === context.goals.total && context.goals.total > 0) {
        insights.push({ message: "All goals complete! Great day.", type: "positive" })
      }
      if (context.health.waterPct < 50) {
        insights.push({ message: `Hydration at ${context.health.waterPct}% — drink 2 glasses now.`, type: "negative" })
      }
      if (context.gym.sessionsThisWeek < 3) {
        insights.push({ message: `${context.gym.sessionsThisWeek}/3 gym sessions this week — schedule one today.`, type: "action" })
      }
      if (context.habits.longestStreak > 0) {
        insights.push({ message: `Best habit streak: ${context.habits.longestStreak} days. Keep it going.`, type: "positive" })
      }
      if (context.sleep.timerActive) {
        insights.push({ message: "Sleep timer is running — rest is tracking.", type: "neutral" })
      }
      break

    case "gym":
      if (context.gym.sessionsThisWeek === 0) {
        insights.push({ message: "No gym sessions this week. Start with an upper body day.", type: "action" })
      } else if (context.gym.sessionsThisWeek >= 3) {
        insights.push({ message: `Great consistency — ${context.gym.sessionsThisWeek} sessions this week.`, type: "positive" })
      }
      break

    case "study":
      if (context.study.avgScore > 0) {
        const grade = context.study.avgScore >= 80 ? "strong" : context.study.avgScore >= 60 ? "improving" : "needs work"
        insights.push({ message: `Average test score ${context.study.avgScore}% — performance is ${grade}.`, type: grade === "strong" ? "positive" : grade === "improving" ? "neutral" : "negative" })
      }
      if (context.study.tasksDone === 0 && context.study.tasksTotal > 0) {
        insights.push({ message: `${context.study.tasksTotal} study tasks pending — start with one now.`, type: "action" })
      }
      break

    case "sleep":
      if (context.sleep.hours < 7) {
        insights.push({ message: `Averaging ${context.sleep.hours}h sleep — below the 8h target.`, type: "negative" })
      } else {
        insights.push({ message: `Sleep consistency at ${context.sleep.hours}h — recovery is solid.`, type: "positive" })
      }
      break

    case "stocks":
      if (context.stocks.holdingsCount === 0) {
        insights.push({ message: "No stocks tracked. Add your first holding to monitor performance.", type: "action" })
      } else {
        insights.push({ message: `${context.stocks.holdingsCount} holdings in your portfolio.`, type: "neutral" })
      }
      break

    case "voice":
      insights.push({ message: "Voice commands: try 'morning briefing', 'log a workout', or 'add a goal'.", type: "action" })
      if (context.memories.total > 0) {
        insights.push({ message: `${context.memories.total} memories stored — ask me to recall anything.`, type: "neutral" })
      }
      break

    case "memory":
      if (context.memories.total === 0) {
        insights.push({ message: "No memories yet. Journal entries and completed goals auto-extract here.", type: "action" })
      } else {
        const cats = context.memories.topCategories.join(", ")
        insights.push({ message: `${context.memories.total} memories across categories: ${cats}.`, type: "positive" })
      }
      break

    case "correlations":
      if (context.journal.totalEntries < 5) {
        insights.push({ message: "Need more journal data to find patterns — keep logging entries.", type: "action" })
      } else {
        insights.push({ message: "Correlations need 30 days of data for meaningful pattern discovery.", type: "neutral" })
      }
      break

    case "future":
      insights.push({ message: "Future self projections compute 3/6/12 month trajectories from your current data.", type: "neutral" })
      if (context.goals.done > 0) {
        insights.push({ message: "Goal completion is strong — this positively influences all projections.", type: "positive" })
      }
      break

    case "report":
      if (context.memories.total < 10) {
        insights.push({ message: "Build more data across modules for a richer annual report.", type: "action" })
      } else {
        insights.push({ message: `${context.memories.total} memories captured — your life report gets richer each day.`, type: "positive" })
      }
      break

    case "briefings":
      const briefingTip = context.timeOfDay === "morning" ? "Start with a morning briefing to plan your day." : "Run an evening review to reflect on what you accomplished."
      insights.push({ message: briefingTip, type: "action" })
      break

    case "odyssey":
      if (context.memories.total > 0) {
        insights.push({ message: `${context.memories.total} memories loaded — I have full context of your life data.`, type: "positive" })
      }
      if (context.decisions.totalDecisions > 0) {
        insights.push({ message: `${context.decisions.totalDecisions} decisions tracked, ${Math.round(context.decisions.positiveOutcomes / context.decisions.totalDecisions * 100)}% positive outcomes.`, type: context.decisions.positiveOutcomes > context.decisions.totalDecisions / 2 ? "positive" : "neutral" })
      }
      break
  }

  return insights
}

export function buildSystemPrompt(context: JarvisContext): string {
  return `You are J.A.R.V.I.S., an AI strategist and personal operating system for LifeOS.

CURRENT USER CONTEXT:
- Time: ${context.timeOfDay}, Day ${context.dayOfWeek}
- Goals: ${context.goals.done}/${context.goals.total} completed today
- Health: Water ${context.health.waterPct}%, Supplements ${context.health.supplementsDone}/${context.health.supplementsTotal}
- Gym: ${context.gym.sessionsThisWeek} sessions this week
- Sleep: ${context.sleep.hours}h average
- Study: ${context.study.tasksDone}/${context.study.tasksTotal} tasks done, avg score ${context.study.avgScore}%
${context.study.weakTopics.length > 0 ? `- Weak study topics: ${context.study.weakTopics.join(", ")} (focus here)` : ""}
${context.study.revisionCycle ? `- Revision cycle: ${context.study.revisionCycle}` : ""}
- Stocks: ${context.stocks.holdingsCount} holdings
- Projects: ${context.projects.activeProject || "none active"}
- Habits: ${context.habits.doneToday}/${context.habits.total} done today, longest streak ${context.habits.longestStreak}d
- Decisions tracked: ${context.decisions.totalDecisions} total, ${context.decisions.positiveOutcomes} positive outcomes
${context.memories.total > 0 ? `- Life memories: ${context.memories.total} total, recent: ${context.memories.recentMemories.slice(0, 2).join(" | ")}` : ""}
${context.memories.topCategories.length > 0 ? `- Memory categories: ${context.memories.topCategories.join(", ")}` : ""}
- Missions: ${context.missions.activeCount} active, ${context.missions.completed}/${context.missions.total} completed
- Journal entries: ${context.journal.totalEntries}${context.journal.recentMood ? `, recent mood: ${context.journal.recentMood}` : ""}

You are on page: /${context.page}

Be concise, strategic, and personalized. Offer actionable advice. Use the user's actual data to ground your responses. Never make up data. If something is missing, suggest they start tracking it.`
}
