"use client"

export interface DailyBriefing {
  greeting: string
  date: string
  timeOfDay: "morning" | "afternoon" | "evening"
  sections: BriefingSection[]
  summary: string
}

export interface BriefingSection {
  title: string
  icon: string
  items: string[]
  type: "positive" | "negative" | "neutral" | "action"
}

export interface WeeklyBriefing {
  weekLabel: string
  score: number
  achievements: string[]
  missedTargets: string[]
  recommendations: string[]
  momentum: "up" | "down" | "stable"
}

export interface MonthlyBriefing {
  monthLabel: string
  growthAreas: string[]
  trends: string[]
  projections: string[]
  overallScore: number
}

import type { Goal, Habit, JournalEntry } from "./types"
import { loadJSON } from "./utils"

function getTimeOfDay(): "morning" | "afternoon" | "evening" {
  const h = new Date().getHours()
  if (h < 12) return "morning"
  if (h < 17) return "afternoon"
  return "evening"
}

export function generateMorningBriefing(username = "Akshat"): DailyBriefing {
  const tod = getTimeOfDay()
  const sections: BriefingSection[] = []
  const today = new Date().toISOString().slice(0, 10)

  const goals: Goal[] = loadJSON(`goals:${today}`) || []
  const done = goals.filter(g => g.done).length
  const total = goals.length
  sections.push({
    title: "Today's Goals",
    icon: "🎯",
    items: total > 0
      ? [`You have ${total} goals for today.`, `${done}/${total} already completed.`]
      : ["No goals set for today yet. Try adding some!"],
    type: total > 0 ? (done > 0 ? "positive" : "neutral") : "action",
  })

  const sleepHours = loadJSON("last_sleep_hours")
  if (sleepHours) {
    const good = sleepHours >= 7
    sections.push({
      title: "Sleep Summary",
      icon: "🌙",
      items: [`Last night: ${sleepHours} hours`, good ? "You met the 7-hour target!" : "Try to get more rest tonight."],
      type: good ? "positive" : "negative",
    })
  }

  const habits: Habit[] = loadJSON("lifeos_habits") || []
  const activeHabits = habits.filter(h => h.logs?.includes(today))
  const longestStreak = Math.max(...habits.map(h => h.streak || 0), 0)
  sections.push({
    title: "Habit Tracker",
    icon: "🔥",
    items: [
      `${activeHabits.length}/${habits.length} habits done today.`,
      longestStreak > 0 ? `Longest streak: ${longestStreak} days!` : "Start building a streak today.",
    ],
    type: activeHabits.length > 0 ? "positive" : "neutral",
  })

  const gymData = loadJSON("gym_dashboard_v1")
  const gymLogs = gymData?.logs || []
  const recentGym = gymLogs.filter((l: { date: string }) => {
    const d = new Date(l.date).getTime()
    return d > Date.now() - 7 * 86400000
  }).length
  sections.push({
    title: "Fitness",
    icon: "💪",
    items: [`${recentGym} gym sessions this week.`, recentGym >= 3 ? "Great consistency!" : "Try to get at least 3 sessions this week."],
    type: recentGym >= 3 ? "positive" : recentGym > 0 ? "neutral" : "action",
  })

  const health = loadJSON("health_dashboard_v1")
  if (health) {
    sections.push({
      title: "Recovery & Health",
      icon: "🧬",
      items: [`Water: ${health.waterMl || 0}ml today.`, health.done?.length ? `${health.done.length} supplements taken.` : "No supplements logged yet."],
      type: (health.waterMl || 0) >= 1000 ? "positive" : "action",
    })
  }

  return {
    greeting: `Good Morning, ${username}`,
    date: new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }),
    timeOfDay: "morning",
    sections,
    summary: `You have ${total} goals, ${activeHabits.length}/${habits.length} habits active, and ${recentGym} gym sessions this week. ${longestStreak > 0 ? `Your best habit streak is ${longestStreak} days!` : ""}`,
  }
}

export function generateEveningReview(username = "Akshat"): DailyBriefing {
  const sections: BriefingSection[] = []
  const today = new Date().toISOString().slice(0, 10)
  const goals: Goal[] = loadJSON(`goals:${today}`) || []
  const done = goals.filter(g => g.done).length
  const total = goals.length
  const rate = total > 0 ? Math.round(done / total * 100) : 0
  sections.push({
    title: "Goal Completion",
    icon: "✅",
    items: [`Completed ${done}/${total} goals (${rate}%).`, rate >= 80 ? "Excellent progress today!" : rate >= 50 ? "Decent progress. Room to improve." : "Tough day. Tomorrow's a fresh start."],
    type: rate >= 80 ? "positive" : rate >= 50 ? "neutral" : "negative",
  })

  const habits: Habit[] = loadJSON("lifeos_habits") || []
  const doneHabits = habits.filter(h => h.logs?.includes(today)).length
  sections.push({
    title: "Habits",
    icon: "🔥",
    items: [`${doneHabits}/${habits.length} habits completed.`, doneHabits === habits.length && habits.length > 0 ? "Perfect habit day!" : ""].filter(Boolean),
    type: doneHabits === habits.length && habits.length > 0 ? "positive" : doneHabits > 0 ? "neutral" : "negative",
  })

  const gymData = loadJSON("gym_dashboard_v1")
  const gymToday = gymData?.logs?.filter((l: { date: string }) => l.date === today).length || 0
  sections.push({
    title: "Activity",
    icon: "⚡",
    items: [gymToday > 0 ? "You worked out today! Great commitment." : "Rest days are important too.", "How do you feel physically?"],
    type: gymToday > 0 ? "positive" : "neutral",
  })

  const journal = loadJSON("lifeos_journal") || []
  const todayEntry = Array.isArray(journal) ? journal.find((e: JournalEntry) => e.date?.startsWith(today)) : null
  if (!todayEntry) {
    sections.push({
      title: "Reflection",
      icon: "📝",
      items: ["You haven't journaled today.", "Even one sentence helps track your journey."],
      type: "action",
    })
  } else {
    sections.push({
      title: "Mood",
      icon: todayEntry.mood === "great" || todayEntry.mood === "good" ? "🌟" : "💭",
      items: [`Your mood today: ${todayEntry.mood}`, "Journal entry logged. Well done!"],
      type: todayEntry.mood === "great" || todayEntry.mood === "good" ? "positive" : "neutral",
    })
  }

  const sleepHours = loadJSON("last_sleep_hours")
  if (sleepHours) {
    const idealBedtime = new Date()
    idealBedtime.setHours(23, 0, 0, 0)
    const hoursToAdd = 8 - (sleepHours || 0)
    const suggested = new Date(idealBedtime.getTime() - (hoursToAdd > 1 ? hoursToAdd * 3600000 : 0))
    sections.push({
      title: "Bedtime Suggestion",
      icon: "🌙",
      items: [`You got ${sleepHours}h last night.`, hoursToAdd > 0 ? `Suggested bedtime: ${suggested.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}` : "Great sleep last night!"],
      type: sleepHours >= 7 ? "positive" : "action",
    })
  }

  return {
    greeting: `Evening Review, ${username}`,
    date: new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }),
    timeOfDay: "evening",
    sections,
    summary: `You completed ${rate}% of goals today. ${doneHabits}/${habits.length} habits done. ${gymToday > 0 ? "Workout logged. " : ""}${!todayEntry ? "Don't forget to journal! " : ""}${sleepHours ? `Sleep target: ${sleepHours >= 7 ? "✓ Met" : "Needs improvement"}.` : ""}`,
  }
}

export function generateWeeklyBriefing(): WeeklyBriefing {
  const now = Date.now()
  const day = 86400000
  const weekAgo = now - 7 * day
  let totalGoals = 0
  let doneGoals = 0
  for (let i = 0; i < 7; i++) {
    const d = new Date(now - i * day).toISOString().slice(0, 10)
    const g: Goal[] = loadJSON(`goals:${d}`) || []
    totalGoals += g.length
    doneGoals += g.filter(x => x.done).length
  }
  const rate = totalGoals > 0 ? Math.round(doneGoals / totalGoals * 100) : 0

  const gymData = loadJSON("gym_dashboard_v1")
  const gymWeek = (gymData?.logs || []).filter((l: { date: string }) => new Date(l.date).getTime() > weekAgo).length

  const journal = loadJSON("lifeos_journal") || []
  const weekEntries = Array.isArray(journal) ? journal.filter((e: JournalEntry) => e.createdAt > weekAgo) : []
  const goodDays = weekEntries.filter(e => e.mood === "great" || e.mood === "good").length
  const moodRate = weekEntries.length > 0 ? Math.round(goodDays / weekEntries.length * 100) : 0

  const habits = loadJSON("lifeos_habits") || []
  let habitDays = 0
  habits.forEach((h: Habit) => {
    const weekLogs = (h.logs || []).filter((d: string) => new Date(d).getTime() > weekAgo).length
    if (weekLogs >= 5) habitDays++
  })

  const sleepLog = loadJSON("sleep_log") || {}
  const entries = Object.values(sleepLog as Record<string, { date: string; hours: string }>).filter(e => e?.date && new Date(e.date).getTime() > weekAgo)
  const avgSleep = entries.length > 0 ? entries.reduce((a: number, e) => a + (parseFloat(e.hours) || 0), 0) / entries.length : 0

  const achievements: string[] = []
  if (rate >= 70) achievements.push(`Completed ${rate}% of goals`)
  if (gymWeek >= 3) achievements.push(`${gymWeek} gym sessions this week`)
  if (moodRate >= 70) achievements.push(`Positive mood ${moodRate}% of the time`)
  if (habitDays >= 3) achievements.push(`${habitDays} habits maintained 5+ days`)
  if (avgSleep >= 7) achievements.push(`Average sleep ${avgSleep.toFixed(1)}h — above target`)

  const missedTargets: string[] = []
  if (rate < 50) missedTargets.push(`Goal completion at ${rate}%`)
  if (gymWeek < 2) missedTargets.push(`Only ${gymWeek} gym session(s)`)
  if (moodRate < 50 && weekEntries.length >= 3) missedTargets.push("Mood trending negative")
  if (avgSleep > 0 && avgSleep < 6.5) missedTargets.push(`Average sleep ${avgSleep.toFixed(1)}h — below target`)

  const recommendations: string[] = []
  if (missedTargets.length > 0) recommendations.push(`Focus on: ${missedTargets[0]}`)
  if (avgSleep < 7 && avgSleep > 0) recommendations.push("Set a consistent bedtime this week")
  if (gymWeek < 3) recommendations.push("Schedule 3 gym sessions for next week")
  recommendations.push("Log at least one journal entry daily for better tracking")
  if (recommendations.length === 0) recommendations.push("Great week! Maintain momentum and focus on consistency.")

  const momentum: "up" | "down" | "stable" = rate >= 70 && gymWeek >= 3 ? "up" : rate < 40 ? "down" : "stable"

  return {
    weekLabel: `Week of ${new Date(weekAgo).toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
    score: Math.round((rate + gymWeek * 10 + moodRate) / 3),
    achievements: achievements.length > 0 ? achievements : ["Building consistency"],
    missedTargets,
    recommendations,
    momentum,
  }
}

export function generateMonthlyBriefing(): MonthlyBriefing {
  const now = Date.now()
  const monthAgo = now - 30 * 86400000
  const monthLabel = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })

  const gymData = loadJSON("gym_dashboard_v1")
  const gymMonth = (gymData?.logs || []).filter((l: { date: string }) => new Date(l.date).getTime() > monthAgo).length
  const gymPrev = (gymData?.logs || []).filter((l: { date: string }) => {
    const t = new Date(l.date).getTime()
    return t > monthAgo - 30 * 86400000 && t <= monthAgo
  }).length

  const journal = loadJSON("lifeos_journal") || []
  const monthEntries = Array.isArray(journal) ? journal.filter((e: JournalEntry) => e.createdAt > monthAgo) : []
  const prevEntries = Array.isArray(journal) ? journal.filter((e: JournalEntry) => e.createdAt > monthAgo - 30 * 86400000 && e.createdAt <= monthAgo) : []
  const goodMonth = monthEntries.filter(e => e.mood === "great" || e.mood === "good").length
  const monthPositivity = monthEntries.length > 0 ? Math.round(goodMonth / monthEntries.length * 100) : 0

  const sleepLog = loadJSON("sleep_log") || {}
  const monthSleep = Object.values(sleepLog as Record<string, { date: string; hours: string }>).filter(e => e?.date && new Date(e.date).getTime() > monthAgo)
  const avgSleep = monthSleep.length > 0 ? monthSleep.reduce((a: number, e) => a + (parseFloat(e.hours) || 0), 0) / monthSleep.length : 0

  const habits: Habit[] = loadJSON("lifeos_habits") || []
  const habitDensity = habits.length > 0 ? Math.round(habits.filter(h => (h.logs || []).filter((d: string) => new Date(d).getTime() > monthAgo).length >= 20).length / habits.length * 100) : 0

  const growthAreas: string[] = []
  if (gymMonth > gymPrev) growthAreas.push(`Gym: ${gymPrev} → ${gymMonth} sessions (${Math.round((gymMonth - gymPrev) / (gymPrev || 1) * 100)}% increase)`)
  if (monthEntries.length > prevEntries.length) growthAreas.push(`Journaling: ${prevEntries.length} → ${monthEntries.length} entries`)
  if (monthPositivity >= 70) growthAreas.push(`Mood stability: ${monthPositivity}% positive`)
  if (avgSleep >= 7) growthAreas.push(`Sleep: ${avgSleep.toFixed(1)}h average`)
  if (habitDensity >= 70) growthAreas.push(`Habit consistency: ${habitDensity}%`)
  if (growthAreas.length === 0) growthAreas.push("Building baseline data — consistency will reveal growth")

  return {
    monthLabel,
    growthAreas,
    trends: [
      `Journal entries: ${monthEntries.length} this month`,
      `Sleep avg: ${avgSleep.toFixed(1)}h`,
      `Gym sessions: ${gymMonth}`,
      `Habit consistency: ${habitDensity}%`,
    ],
    projections: [
      gymMonth > 0 ? `At current pace: ${Math.round(gymMonth / 30 * 365)} gym sessions per year` : "Start gym tracking to get projections",
      habitDensity > 0 ? `Habit score trending toward ${Math.min(100, habitDensity + 10)}% next month` : "Build habit streaks for projections",
      avgSleep > 0 ? (avgSleep < 7 ? "Increasing sleep by 30min could boost all metrics 10-15%" : "Sleep quality is optimal — maintain it") : "Track sleep for personalized projections",
    ],
    overallScore: Math.round(((gymMonth / 12) * 30 + monthPositivity + habitDensity + Math.min(100, avgSleep / 8 * 100)) / 4),
  }
}

export function generateBriefingVoiceText(briefing: DailyBriefing): string {
  let text = `${briefing.greeting}. ${briefing.date}. `
  for (const section of briefing.sections) {
    text += section.title + ". "
    text += section.items.join(" ") + ". "
  }
  return text
}
