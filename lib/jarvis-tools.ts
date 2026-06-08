"use client"

import type { Goal, Habit } from "./types"
import type { ToolCall } from "./jarvis-tool-defs"
import { markModified } from "./store"
import { dispatchDataChanged } from "./events"

export function executeToolCall(call: ToolCall): string {
  switch (call.name) {
    case "addGoal":
      return executeAddGoal(call.arguments as { text: string; priority?: string; dueDate?: string; estimatedMinutes?: number })
    case "toggleGoal":
      return executeToggleGoal(call.arguments as { text: string })
    case "deleteGoal":
      return executeDeleteGoal(call.arguments as { text: string })
    case "logWater":
      return executeLogWater(call.arguments as { ml: number })
    case "logHabit":
      return executeLogHabit(call.arguments as { name: string })
    case "journalEntry":
      return executeJournalEntry(call.arguments as { content: string; mood: string })
    case "getGoals":
      return executeGetGoals()
    case "getContext":
      return executeGetContext()
    default:
      return `Unknown tool: ${call.name}`
  }
}

function toDateKey(date?: Date): string {
  const d = date || new Date()
  return d.toISOString().slice(0, 10)
}

function storeGet<T>(key: string): T | null {
  try { return JSON.parse(localStorage.getItem(key) || "null") }
  catch { return null }
}

function storeSet(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
  localStorage.setItem("_ts:" + key, new Date().toISOString())
  markModified(key)
}

function executeAddGoal(args: { text: string; priority?: string; dueDate?: string; estimatedMinutes?: number }): string {
  if (!args.text?.trim()) return "Error: text is required"
  const key = "goals:" + toDateKey()
  const goals: Goal[] = storeGet<Goal[]>(key) || []
  goals.push({
    text: args.text.trim(),
    done: false,
    priority: args.priority as "low" | "medium" | "high" | undefined,
    dueDate: args.dueDate,
    estimatedMinutes: args.estimatedMinutes,
  })
  storeSet(key, goals)

  const pending: Goal[] = storeGet<Goal[]>("lifeos_pending_goals") || []
  pending.push({
    text: args.text.trim(),
    done: false,
    priority: args.priority as "low" | "medium" | "high" | undefined,
    dueDate: args.dueDate,
    estimatedMinutes: args.estimatedMinutes,
  })
  storeSet("lifeos_pending_goals", pending)

  dispatchDataChanged(["goals", "lifeos_pending_goals"], "jarvis")
  return `Added goal: "${args.text.trim()}"`
}

function executeToggleGoal(args: { text: string }): string {
  if (!args.text?.trim()) return "Error: text is required"
  const key = "goals:" + toDateKey()
  const goals: Goal[] = storeGet<Goal[]>(key) || []
  const idx = goals.findIndex(g => g.text === args.text.trim())
  if (idx === -1) return `Goal not found: "${args.text.trim()}"`
  goals[idx].done = !goals[idx].done
  goals[idx].doneAt = goals[idx].done ? Date.now() : undefined
  storeSet(key, goals)

  const pending: Goal[] = storeGet<Goal[]>("lifeos_pending_goals") || []
  const pIdx = pending.findIndex(g => g.text === args.text.trim())
  if (pIdx !== -1) {
    pending[pIdx].done = goals[idx].done
    storeSet("lifeos_pending_goals", pending)
  }

  dispatchDataChanged(["goals", "lifeos_pending_goals"], "jarvis")
  return `Toggled goal "${args.text.trim()}" to ${goals[idx].done ? "done" : "undone"}`
}

function executeDeleteGoal(args: { text: string }): string {
  if (!args.text?.trim()) return "Error: text is required"
  const key = "goals:" + toDateKey()
  const goals: Goal[] = storeGet<Goal[]>(key) || []
  const filtered = goals.filter(g => g.text !== args.text.trim())
  if (filtered.length === goals.length) return `Goal not found: "${args.text.trim()}"`
  storeSet(key, filtered)

  const pending: Goal[] = storeGet<Goal[]>("lifeos_pending_goals") || []
  storeSet("lifeos_pending_goals", pending.filter(g => g.text !== args.text.trim()))

  dispatchDataChanged(["goals", "lifeos_pending_goals"], "jarvis")
  return `Deleted goal: "${args.text.trim()}"`
}

function executeLogWater(args: { ml: number }): string {
  if (!args.ml || args.ml <= 0) return "Error: ml must be a positive number"
  const key = "health_dashboard_v1"
  const health: Record<string, unknown> = storeGet<Record<string, unknown>>(key) || {}
  health.waterMl = ((health.waterMl as number) || 0) + args.ml
  storeSet(key, health)
  dispatchDataChanged([key], "jarvis")
  return `Logged ${args.ml}ml of water. Total today: ${health.waterMl}ml`
}

function executeLogHabit(args: { name: string }): string {
  if (!args.name?.trim()) return "Error: name is required"
  const key = "lifeos_habits"
  const habits: Habit[] = storeGet<Habit[]>(key) || []
  const today = toDateKey()
  const habit = habits.find(h => h.name?.toLowerCase() === args.name.trim().toLowerCase())
  if (!habit) return `Habit not found: "${args.name.trim()}". Available habits: ${habits.map(h => h.name || h.id).join(", ")}`
  const logs = habit.logs || []
  if (logs.includes(today)) return `Habit "${args.name.trim()}" already logged today`
  logs.push(today)
  habit.logs = logs
  storeSet(key, habits)
  dispatchDataChanged([key], "jarvis")
  return `Logged habit "${args.name.trim()}" for today`
}

function executeJournalEntry(args: { content: string; mood: string }): string {
  if (!args.content?.trim()) return "Error: content is required"
  const validMoods = ["great", "good", "okay", "bad", "awful"]
  const mood = validMoods.includes(args.mood) ? args.mood : "okay"
  const key = "lifeos_journal"
  const entries: Record<string, unknown>[] = storeGet<Record<string, unknown>[]>(key) || []
  entries.unshift({
    id: `j_${Date.now()}`,
    content: args.content.trim(),
    mood,
    createdAt: new Date().toISOString(),
  })
  storeSet(key, entries)
  dispatchDataChanged([key], "jarvis")
  return `Journal entry saved. Mood: ${mood}`
}

function executeGetGoals(): string {
  const key = "goals:" + toDateKey()
  const goals: Goal[] = storeGet<Goal[]>(key) || []
  if (goals.length === 0) return "No goals for today"
  const done = goals.filter(g => g.done).length
  const lines = goals.map((g, i) => `${g.done ? "[x]" : "[ ]"} ${g.text}${g.priority ? ` (${g.priority})` : ""}`)
  return `${done}/${goals.length} goals done:\n` + lines.join("\n")
}

function executeGetContext(): string {
  const today = toDateKey()
  const hour = new Date().getHours()
  const timeOfDay = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening"
  const goals: Goal[] = storeGet<Goal[]>("goals:" + today) || []
  const health: Record<string, unknown> = storeGet<Record<string, unknown>>("health_dashboard_v1") || {}
  const habits: Habit[] = storeGet<Habit[]>("lifeos_habits") || []
  const journal: Record<string, unknown>[] = storeGet<Record<string, unknown>[]>("lifeos_journal") || []
  const sleepHrs: number = storeGet<number>("last_sleep_hours") || 8
  return [
    `Time: ${timeOfDay}`,
    `Goals: ${goals.filter(g => g.done).length}/${goals.length} done`,
    `Water: ${Math.round(((health.waterMl as number) || 0) / 2000 * 100)}% of target`,
    `Sleep: ${sleepHrs}h average`,
    `Habits: ${habits.filter(h => h.logs?.includes(today)).length}/${habits.length} done today`,
    `Journal entries: ${journal.length} total`,
    `Latest mood: ${(journal[0] as Record<string, string> | undefined)?.mood || "none recorded"}`,
  ].join("\n")
}
