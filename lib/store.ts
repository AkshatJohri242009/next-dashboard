"use client"

import { create } from "zustand"
import type { Goal, HealthState, GymState, Reminder } from "./types"
import {
  getActiveDateString, getTomorrowDateString,
  keyFor, todayKey, tomorrowKey,
} from "./utils"
import { pullFromSupabase, pushToSupabase } from "./supabase"

function storeGet<T>(key: string): T | null {
  try { return JSON.parse(localStorage.getItem(key) || "null") }
  catch { return null }
}

function storeSet(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

function allLocalState(): Record<string, unknown> {
  const state: Record<string, unknown> = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && (key.startsWith("goals:") || [
      "goal_streak_v1", "health_dashboard_v1", "gym_dashboard_v1",
      "last_sleep_hours", "weight_entries_v1",
    ].includes(key))) {
      try { state[key] = JSON.parse(localStorage.getItem(key)!) }
      catch { state[key] = localStorage.getItem(key) }
    }
  }
  return state
}

function getGoals(key: string): Goal[] {
  const g = storeGet<Goal[]>(key)
  return Array.isArray(g) ? g : []
}

interface DashboardState {
  goals: Goal[]
  tomorrowGoals: Goal[]
  streak: number
  sleep: number
  sidebarOpen: boolean
  commandPaletteOpen: boolean
  aiPanelOpen: boolean
  notificationPanelOpen: boolean
  mobileMenuOpen: boolean
  activePage: string

  loadGoals: () => void
  addGoal: (text: string, reminderMin?: number) => void
  toggleGoal: (idx: number) => void
  deleteGoal: (idx: number) => void
  editGoal: (idx: number, text: string) => void
  toggleQueued: (idx: number) => void
  reorderGoals: (goals: Goal[]) => void
  pushToTomorrow: () => void
  setSleep: (hours: number) => void
  toggleSidebar: () => void
  setCommandPalette: (open: boolean) => void
  setAIPanel: (open: boolean) => void
  setNotificationPanel: (open: boolean) => void
  setMobileMenu: (open: boolean) => void
  setActivePage: (page: string) => void
  supabaseReady: boolean
  syncWithSupabase: () => Promise<void>

  reminders: Reminder[]
  addReminder: (text: string, type: Reminder["type"], minutes: number, goalIdx?: number) => void
  completeReminder: (id: string) => void
  deleteReminder: (id: string) => void
  waterTimerMin: number
  lastWaterNotif: number
  setWaterTimerMin: (m: number) => void
  markWaterNotif: () => void

  health: HealthState
  loadHealth: () => void
  updateHealth: (partial: Partial<HealthState>) => void
  toggleSupp: (key: string) => void
  toggleLow: (item: string) => void
  addWater: (ml: number) => void
  resetWater: () => void

  gym: GymState
  loadGym: () => void
  setSplit: (split: string) => void
  addLog: (log: GymState["logs"][0]) => void
  deleteLog: (idx: number) => void
  setPhoto: (id: string, data: string) => void
}

const defaultHealth: HealthState = {
  weight: 70, age: 18, activity: 1,
  caffeine: 150, stimulants: 0,
  waterMl: 0, done: {}, low: {},
}

const defaultGym: GymState = {
  split: "Push Day", logs: [], photos: {},
}

export const useStore = create<DashboardState>((set, get) => ({
  goals: [],
  tomorrowGoals: [],
  streak: 0,
  sleep: 8,
  sidebarOpen: true,
  commandPaletteOpen: false,
  aiPanelOpen: false,
  notificationPanelOpen: false,
  mobileMenuOpen: false,
  activePage: "main",
  supabaseReady: false,

  reminders: [],
  waterTimerMin: 30,
  lastWaterNotif: 0,

  syncWithSupabase: async () => {
    const remote = await pullFromSupabase()
    if (remote === null) {
      // Supabase not configured (no env vars)
      set({ supabaseReady: false })
      return
    }
    if (Object.keys(remote).length === 0) {
      // Empty remote, push local
      await pushToSupabase(allLocalState())
    } else {
      // Merge remote into localStorage
      for (const [key, value] of Object.entries(remote)) {
        localStorage.setItem(key, JSON.stringify(value))
      }
      // Push any local keys the remote doesn't have
      const local = allLocalState()
      const merged = { ...remote, ...local }
      await pushToSupabase(merged)
    }
    set({ supabaseReady: true })
    get().loadGoals()
    get().loadHealth()
    get().loadGym()
  },

  loadGoals: () => {
    const goals = getGoals(todayKey())
    const tomorrowGoals = getGoals(tomorrowKey())
    const streakData = storeGet<{ count: number }>("goal_streak_v1")
    const sleepData = storeGet<number>("last_sleep_hours")
    set({
      goals,
      tomorrowGoals,
      streak: streakData?.count ?? 0,
      sleep: typeof sleepData === "number" ? sleepData : 8,
    })
  },

  addGoal: (text, reminderMin) => {
    const key = todayKey()
    const goals = getGoals(key)
    goals.push({ text, done: false, reminderMin })
    storeSet(key, goals)
    set({ goals })
    if (reminderMin && reminderMin > 0) {
      get().addReminder(text, "task", reminderMin, goals.length - 1)
    }
  },

  toggleGoal: (idx) => {
    const key = todayKey()
    const goals = getGoals(key)
    if (goals[idx]) {
      goals[idx].done = !goals[idx].done
      goals[idx].doneAt = goals[idx].done ? Date.now() : undefined
      storeSet(key, goals)
      set({ goals: [...goals] })
    }
  },

  deleteGoal: (idx) => {
    const key = todayKey()
    const goals = getGoals(key)
    goals.splice(idx, 1)
    storeSet(key, goals)
    set({ goals: [...goals] })
  },

  editGoal: (idx, text) => {
    const key = todayKey()
    const goals = getGoals(key)
    if (goals[idx]) {
      goals[idx].text = text
      storeSet(key, goals)
      set({ goals: [...goals] })
    }
  },

  toggleQueued: (idx) => {
    const key = todayKey()
    const goals = getGoals(key)
    if (goals[idx]) {
      goals[idx].queued = !goals[idx].queued
      storeSet(key, goals)
      set({ goals: [...goals] })
    }
  },

  reorderGoals: (newOrder) => {
    const key = todayKey()
    storeSet(key, newOrder)
    set({ goals: newOrder })
  },

  pushToTomorrow: () => {
    const today = getGoals(todayKey())
    const remaining = today.filter(g => !g.done)
    if (!remaining.length) return
    const tomorrow = getGoals(tomorrowKey())
    remaining.forEach(goal => {
      if (!tomorrow.some(e => e.text === goal.text)) {
        tomorrow.push({
          text: goal.text,
          done: false,
          queued: Boolean(goal.queued),
          pushedCount: (Number(goal.pushedCount) || 0) + 1,
        })
      }
    })
    storeSet(tomorrowKey(), tomorrow)
    storeSet(todayKey(), today.filter(g => g.done))
    set({
      goals: getGoals(todayKey()),
      tomorrowGoals: getGoals(tomorrowKey()),
    })
  },

  setSleep: (hours) => {
    set({ sleep: hours })
    localStorage.setItem("last_sleep_hours", JSON.stringify(hours))
  },

  toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
  setCommandPalette: (open) => set({ commandPaletteOpen: open }),
  setAIPanel: (open) => set({ aiPanelOpen: open }),
  setNotificationPanel: (open) => set({ notificationPanelOpen: open }),
  setMobileMenu: (open) => set({ mobileMenuOpen: open }),
  setActivePage: (page) => set({ activePage: page }),

  addReminder: (text, type, minutes, goalIdx) => set(s => ({
    reminders: [...s.reminders, {
      id: `rem_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      text, type, goalIdx,
      dueAt: Date.now() + minutes * 60000,
      completed: false,
    }],
  })),
  completeReminder: (id) => set(s => ({
    reminders: s.reminders.map(r => r.id === id ? { ...r, completed: true } : r),
  })),
  deleteReminder: (id) => set(s => ({
    reminders: s.reminders.filter(r => r.id !== id),
  })),
  setWaterTimerMin: (m) => set({ waterTimerMin: m, lastWaterNotif: Date.now() }),
  markWaterNotif: () => set({ lastWaterNotif: Date.now() }),

  health: { ...defaultHealth },
  loadHealth: () => {
    const saved = storeGet<Partial<HealthState>>("health_dashboard_v1")
    set({ health: { ...defaultHealth, ...saved } })
  },
  updateHealth: (partial) => {
    const health = { ...get().health, ...partial }
    storeSet("health_dashboard_v1", health)
    set({ health })
  },
  toggleSupp: (key) => {
    const health = { ...get().health, done: { ...get().health.done } }
    health.done[key] = !health.done[key]
    storeSet("health_dashboard_v1", health)
    set({ health })
  },
  toggleLow: (item) => {
    const health = { ...get().health, low: { ...get().health.low } }
    health.low[item] = !health.low[item]
    storeSet("health_dashboard_v1", health)
    set({ health })
  },
  addWater: (ml) => {
    const health = { ...get().health, waterMl: (get().health.waterMl || 0) + ml }
    storeSet("health_dashboard_v1", health)
    set({ health })
  },
  resetWater: () => {
    const health = { ...get().health, waterMl: 0 }
    storeSet("health_dashboard_v1", health)
    set({ health })
  },

  gym: { ...defaultGym },
  loadGym: () => {
    const saved = storeGet<Partial<GymState>>("gym_dashboard_v1")
    set({ gym: { ...defaultGym, ...saved } })
  },
  setSplit: (split) => {
    const gym = { ...get().gym, split }
    storeSet("gym_dashboard_v1", gym)
    set({ gym })
  },
  addLog: (log) => {
    const gym = { ...get().gym, logs: [...get().gym.logs, log] }
    storeSet("gym_dashboard_v1", gym)
    set({ gym })
  },
  deleteLog: (idx) => {
    const gym = { ...get().gym, logs: get().gym.logs.filter((_, i) => i !== idx) }
    storeSet("gym_dashboard_v1", gym)
    set({ gym })
  },
  setPhoto: (id, data) => {
    const gym = { ...get().gym, photos: { ...get().gym.photos, [id]: data } }
    storeSet("gym_dashboard_v1", gym)
    set({ gym })
  },
}))
