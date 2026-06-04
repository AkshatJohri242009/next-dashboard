"use client"

export interface Correlation {
  id: string
  title: string
  description: string
  strength: "strong" | "moderate" | "weak"
  direction: "positive" | "negative"
  sourceA: string
  sourceB: string
  valueA: number
  valueB: number
  confidence: number
  insight: string
}

interface DaySnapshot {
  date: string
  sleep: number | null
  gym: boolean
  mood: string | null
  moodScore: number | null
  goalsDone: number
  goalsTotal: number
  waterMl: number
  habitCompletion: number
  habitTotal: number
  studyScore: number | null
  studyTasks: number
}

import type { Goal, GymState, Habit, JournalEntry } from "./types"
import type { StudyTask, StudyScore } from "./study-types"
import { loadJSON } from "./utils"

function getLastNDays(n: number): DaySnapshot[] {
  const now = Date.now()
  const day = 86400000
  const snapshots: DaySnapshot[] = []

  for (let i = 0; i < n; i++) {
    const date = new Date(now - i * day).toISOString().slice(0, 10)

    const goals: Goal[] = loadJSON(`goals:${date}`) || []
    const done = goals.filter(g => g.done).length

    const sleepLog = loadJSON("sleep_log") || {}
    const sleepEntry = Object.values(sleepLog as Record<string, { date: string; hours: string }>).find(e => e?.date === date)
    const sleepHours = sleepEntry ? parseFloat(sleepEntry.hours) || null : null

    const gymData = loadJSON("gym_dashboard_v1")
    const gymToday = gymData?.logs?.filter((l: { date: string }) => l.date === date).length > 0

    const journal = loadJSON("lifeos_journal") || []
    const journalEntry = Array.isArray(journal) ? journal.find((e: JournalEntry) => e.date?.startsWith(date)) : null
    const moodMap: Record<string, number> = { great: 5, good: 4, okay: 3, bad: 2, awful: 1 }

    const habits = loadJSON("lifeos_habits") || []
    const habitDone = habits.filter((h: Habit) => h.logs?.includes(date)).length

    const health = loadJSON("health_dashboard_v1")
    const waterMl = health?.waterMl || 0

    const study = loadJSON("study_tasks_v1") || []
    const studyDone = Array.isArray(study) ? study.filter((t: StudyTask) => t.done).length : 0
    const studyTotal = Array.isArray(study) ? study.length : 0

    const studyScores = loadJSON("study_scores_v1") || []
    const todayScores = Array.isArray(studyScores) ? studyScores.filter((s: StudyScore) => s.date === date) : []
    const avgScore = todayScores.length > 0 ? todayScores.reduce((a: number, s: StudyScore) => a + (s.score || 0), 0) / todayScores.length : null

    snapshots.push({
      date,
      sleep: sleepHours,
      gym: gymToday,
      mood: journalEntry?.mood || null,
      moodScore: journalEntry ? (moodMap[journalEntry.mood] || null) : null,
      goalsDone: done,
      goalsTotal: goals.length,
      waterMl,
      habitCompletion: habitDone,
      habitTotal: habits.length,
      studyScore: avgScore,
      studyTasks: studyDone,
    })
  }
  return snapshots
}

function avg(arr: (number | null)[]): number {
  const valid = arr.filter((x): x is number => x !== null)
  return valid.length > 0 ? valid.reduce((a, b) => a + b, 0) / valid.length : 0
}

export function discoverCorrelations(): Correlation[] {
  const snapshots = getLastNDays(30)
  if (snapshots.length < 7) return []

  const results: Correlation[] = []
  const id = () => `corr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`

  const highSleep = snapshots.filter(d => d.sleep !== null && d.sleep >= 7)
  const lowSleep = snapshots.filter(d => d.sleep !== null && d.sleep < 7)
  if (highSleep.length >= 3 && lowSleep.length >= 3) {
    const highMood = avg(highSleep.map(d => d.moodScore))
    const lowMood = avg(lowSleep.map(d => d.moodScore))
    if (highMood !== null && lowMood !== null && highMood !== lowMood) {
      const diff = Math.round((highMood - lowMood) / 5 * 100)
      results.push({
        id: id(),
        title: "Sleep → Mood",
        description: `${highSleep.length} days with 7h+ sleep vs ${lowSleep.length} days with less`,
        strength: Math.abs(diff) >= 20 ? "strong" : Math.abs(diff) >= 10 ? "moderate" : "weak",
        direction: diff > 0 ? "positive" : "negative",
        sourceA: "Sleep",
        sourceB: "Mood",
        valueA: parseFloat(avg(highSleep.map(d => d.sleep!)).toFixed(1)),
        valueB: highMood,
        confidence: Math.min(100, Math.round((highSleep.length + lowSleep.length) / 30 * 100)),
        insight: diff > 0
          ? `Sleeping 7h+ is associated with ${Math.abs(diff)}% better mood scores`
          : `Sleep may not be the primary mood driver (${Math.abs(diff)}% variance)`,
      })
    }
  }

  const gymDays = snapshots.filter(d => d.gym)
  const restDays = snapshots.filter(d => !d.gym)
  if (gymDays.length >= 3 && restDays.length >= 3) {
    const gymMood = avg(gymDays.map(d => d.moodScore))
    const restMood = avg(restDays.map(d => d.moodScore))
    if (gymMood && restMood && gymMood !== restMood) {
      const diff = Math.round((gymMood - restMood) / 5 * 100)
      results.push({
        id: id(),
        title: "Gym → Mood",
        description: `${gymDays.length} gym days vs ${restDays.length} rest days`,
        strength: Math.abs(diff) >= 20 ? "strong" : Math.abs(diff) >= 10 ? "moderate" : "weak",
        direction: diff > 0 ? "positive" : "negative",
        sourceA: "Gym",
        sourceB: "Mood",
        valueA: gymDays.length,
        valueB: gymMood,
        confidence: Math.min(100, Math.round((gymDays.length + restDays.length) / 30 * 100)),
        insight: diff > 0
          ? `Gym days show ${Math.abs(diff)}% higher mood — exercise boosts your state`
          : `Gym has minimal impact on mood — other factors at play`,
      })
    }

    const gymGoalRate = avg(gymDays.map(d => d.goalsTotal > 0 ? d.goalsDone / d.goalsTotal : null))
    const restGoalRate = avg(restDays.map(d => d.goalsTotal > 0 ? d.goalsDone / d.goalsTotal : null))
    if (gymGoalRate !== null && restGoalRate !== null && gymGoalRate !== restGoalRate) {
      const diff = Math.round((gymGoalRate - restGoalRate) * 100)
      results.push({
        id: id(),
        title: "Gym → Productivity",
        description: `Goal completion rate on gym vs rest days`,
        strength: Math.abs(diff) >= 20 ? "strong" : Math.abs(diff) >= 10 ? "moderate" : "weak",
        direction: diff > 0 ? "positive" : "negative",
        sourceA: "Gym",
        sourceB: "Productivity",
        valueA: gymDays.length,
        valueB: Math.round(gymGoalRate * 100),
        confidence: Math.min(100, Math.round((gymDays.length + restDays.length) / 30 * 100)),
        insight: diff > 0
          ? `You complete ${Math.abs(diff)}% more goals on gym days`
          : `Goal completion is similar on gym and rest days`,
      })
    }
  }

  const highHabit = snapshots.filter(d => d.habitTotal > 0 && d.habitCompletion / d.habitTotal >= 0.7)
  const lowHabit = snapshots.filter(d => d.habitTotal > 0 && d.habitCompletion / d.habitTotal < 0.7)
  if (highHabit.length >= 3 && lowHabit.length >= 3) {
    const habitMood = avg(highHabit.map(d => d.moodScore))
    const lowHabitMood = avg(lowHabit.map(d => d.moodScore))
    if (habitMood !== null && lowHabitMood !== null) {
      const diff = Math.round((habitMood - lowHabitMood) / 5 * 100)
      results.push({
        id: id(),
        title: "Habit Completion → Mood",
        description: `High habit days (≥70%) vs low habit days`,
        strength: Math.abs(diff) >= 15 ? "moderate" : "weak",
        direction: diff > 0 ? "positive" : "negative",
        sourceA: "Habits",
        sourceB: "Mood",
        valueA: Math.round(highHabit.length / snapshots.length * 100),
        valueB: habitMood,
        confidence: Math.min(100, Math.round((highHabit.length + lowHabit.length) / 30 * 100)),
        insight: diff > 0
          ? `Completing habits correlates with ${Math.abs(diff)}% better mood`
          : `Habit completion has limited mood correlation`,
      })
    }
  }

  const waterDays = snapshots.filter(d => d.waterMl >= 1500)
  const lowWaterDays = snapshots.filter(d => d.waterMl > 0 && d.waterMl < 1500)
  if (waterDays.length >= 3 && lowWaterDays.length >= 3) {
    const waterMood = avg(waterDays.map(d => d.moodScore))
    const lowWaterMood = avg(lowWaterDays.map(d => d.moodScore))
    if (waterMood !== null && lowWaterMood !== null && waterMood !== lowWaterMood) {
      const diff = Math.round((waterMood - lowWaterMood) / 5 * 100)
      results.push({
        id: id(),
        title: "Hydration → Mood",
        description: `Days with ≥1500ml vs &lt;1500ml water`,
        strength: Math.abs(diff) >= 15 ? "moderate" : "weak",
        direction: diff > 0 ? "positive" : "negative",
        sourceA: "Hydration",
        sourceB: "Mood",
        valueA: Math.round(avg(waterDays.map(d => d.waterMl))),
        valueB: waterMood,
        confidence: Math.min(100, Math.round((waterDays.length + lowWaterDays.length) / 30 * 100)),
        insight: diff > 0
          ? `Staying hydrated is linked to ${Math.abs(diff)}% better mood`
          : `Hydration shows minimal mood correlation`,
      })
    }
  }

  const highWaterGoal = snapshots.filter(d => d.waterMl >= 1500)
  const lowWaterGoal = snapshots.filter(d => d.waterMl < 1500)
  if (highWaterGoal.length >= 3 && lowWaterGoal.length >= 3) {
    const highRate = avg(highWaterGoal.map(d => d.goalsTotal > 0 ? d.goalsDone / d.goalsTotal : null))
    const lowRate = avg(lowWaterGoal.map(d => d.goalsTotal > 0 ? d.goalsDone / d.goalsTotal : null))
    if (highRate !== null && lowRate !== null && highRate !== lowRate) {
      const diff = Math.round((highRate - lowRate) * 100)
      results.push({
        id: id(),
        title: "Hydration → Productivity",
        description: `Goal completion on hydrated vs dehydrated days`,
        strength: Math.abs(diff) >= 15 ? "moderate" : "weak",
        direction: diff > 0 ? "positive" : "negative",
        sourceA: "Hydration",
        sourceB: "Productivity",
        valueA: Math.round(avg(highWaterGoal.map(d => d.waterMl))),
        valueB: Math.round(highRate! * 100),
        confidence: Math.min(100, Math.round((highWaterGoal.length + lowWaterGoal.length) / 30 * 100)),
        insight: diff > 0
          ? `You're ${Math.abs(diff)}% more productive on well-hydrated days`
          : `Hydration has limited impact on goal completion`,
      })
    }
  }

  return results
}

export function generateCorrelationInsight(correlations: Correlation[]): string {
  if (correlations.length === 0) return "Not enough data yet. Keep tracking for 7+ days to discover patterns."
  const strongest = correlations.filter(c => c.strength === "strong")
  if (strongest.length > 0) {
    const top = strongest[0]
    return `Key pattern: ${top.title}. ${top.insight} (${top.confidence}% confidence)`
  }
  const moderate = correlations.filter(c => c.strength === "moderate")
  if (moderate.length > 0) {
    return `Pattern found: ${moderate[0].title}. ${moderate[0].insight}`
  }
  return `Data collected: ${correlations.length} patterns detected. Continue tracking for stronger signals.`
}
