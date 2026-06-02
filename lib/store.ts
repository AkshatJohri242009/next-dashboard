"use client"

import { create } from "zustand"
import { ROUTES } from "./routes"
import type { Goal, HealthState, GymState, Reminder, GitHubRepo, TrackedProject, SleepEntry, StockHolding, StockQuote, ThemeConfig } from "./types"
import {
  getActiveDateString, getTomorrowDateString,
  keyFor, todayKey, tomorrowKey, toDateString,
} from "./utils"
import { pullFromSupabase, pushToSupabase, type SyncEntry } from "./supabase"
import type { StudyTask } from "./study-types"

const recentlyModified = new Set<string>()
let clearRecentlyModified: ReturnType<typeof setTimeout> | null = null

export function markModified(key: string) {
  recentlyModified.add(key)
  if (clearRecentlyModified) clearTimeout(clearRecentlyModified)
  clearRecentlyModified = setTimeout(() => recentlyModified.clear(), 5000)
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

function applyTheme(theme: ThemeConfig) {
  const root = document.documentElement
  root.style.setProperty("--brand", theme.brandColor)
  root.style.setProperty("--accent", theme.accentColor)
  root.style.setProperty("--brand-500", theme.brandColor)
  root.style.setProperty("--accent-500", theme.accentColor)
  root.classList.toggle("light", theme.mode === "light")
}

export function autoSync() {
  pushToSupabase(allLocalState())
}

async function waitSync() {
  try { await pushToSupabase(allLocalState()) } catch {}
}

export function allLocalState(): Record<string, unknown> {
  const state: Record<string, unknown> = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && (
      key.startsWith("goals:") ||
      key.startsWith("sleep_") ||
      key.startsWith("water_") ||
      key.startsWith("tracked_") ||
      key.startsWith("featured_") ||
      [
        "goal_streak_v1", "health_dashboard_v1", "gym_dashboard_v1",
        "last_sleep_hours", "weight_entries_v1", "reminders_v1",
        "water_timer_min_v1", "water_last_notif_v1",
        "exam_dates_v1", "study_files_v1",
        "study_tasks_v1", "study_streak_v1",
        "study_scores_v1", "study_errors_v1",
        "stocks_holdings_v1", "stocks_quotes_v1",
        "theme_v1",
        "lifeos_journal", "lifeos_chapters", "lifeos_missions", "lifeos_decisions", "lifeos_brain", "lifeos_timeline", "lifeos_habits",
      ].includes(key)
    )) {
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
  focusOpen: boolean
  commandPaletteOpen: boolean
  aiPanelOpen: boolean
  notificationPanelOpen: boolean
  mobileMenuOpen: boolean
  activePage: string

  sleepTimerStart: number | null
  sleepLog: SleepEntry[]
  startSleepTimer: () => void
  stopSleepTimer: () => void
  loadSleepLog: () => void
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
  setFocusOpen: (open: boolean) => void
  setCommandPalette: (open: boolean) => void
  setAIPanel: (open: boolean) => void
  setNotificationPanel: (open: boolean) => void
  setMobileMenu: (open: boolean) => void
  setActivePage: (page: string) => void
  supabaseReady: boolean
  syncCount: number
  syncWithSupabase: () => Promise<void>

  reminders: Reminder[]
  saveReminders: () => void
  loadReminders: () => void
  addReminder: (text: string, type: Reminder["type"], minutes: number, goalIdx?: number) => void
  completeReminder: (id: string) => void
  deleteReminder: (id: string) => void
  waterTimerMin: number
  lastWaterNotif: number
  lastSleepNotif: number
  setWaterTimerMin: (m: number) => void
  markWaterNotif: () => void
  markSleepNotif: () => void

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
  addCustomExercise: (name: string) => void
  deleteCustomExercise: (name: string) => void

  repos: GitHubRepo[]
  featuredRepos: string[]
  currentProject: string | null
  trackedProjects: TrackedProject[]
  setRepos: (repos: GitHubRepo[]) => void
  loadTrackedProjects: () => void
  removeTrackedProject: (name: string) => void
  toggleFeatured: (name: string) => void
  setCurrentProject: (name: string | null) => void
  startTracking: () => void
  stopTracking: () => void

  mode: "work" | "study"
  setMode: (m: "work" | "study") => void
  lastWorkPath: string
  lastStudyPath: string
  setLastWorkPath: (path: string) => void
  setLastStudyPath: (path: string) => void
  studyTasks: StudyTask[]
  studyStreak: number
  loadStudyData: () => void
  addStudyTask: (text: string) => void
  toggleStudyTask: (id: string) => void
  deleteStudyTask: (id: string) => void

  stockHoldings: StockHolding[]
  stockQuotes: Record<string, StockQuote>
  stockExpandedSymbol: string | null
  loadStocks: () => void
  addStock: (symbol: string, shares: number, buyPrice?: number) => void
  removeStock: (symbol: string) => void
  setStockExpanded: (symbol: string | null) => void
  fetchStockQuotes: () => Promise<void>

  theme: ThemeConfig
  setTheme: (theme: ThemeConfig) => void
}

const defaultHealth: HealthState = {
  weight: 70, age: 18, activity: 1,
  caffeine: 150, stimulants: 0,
  waterMl: 0, done: {}, low: {},
}

const defaultGym: GymState = {
  split: "Push Day",
  logs: [],
  photos: {},
  customExercises: [],
}

export const useStore = create<DashboardState>((set, get) => ({
  goals: [],
  tomorrowGoals: [],
  streak: 0,
  sleep: 8,
  sleepTimerStart: null,
  sleepLog: [],
  sidebarOpen: true,
  focusOpen: false,
  commandPaletteOpen: false,
  aiPanelOpen: false,
  notificationPanelOpen: false,
  mobileMenuOpen: false,
  activePage: "main",
  supabaseReady: false,
  syncCount: 0,

  reminders: [],
  waterTimerMin: 45,
  lastWaterNotif: 0,
  lastSleepNotif: 0,

  syncWithSupabase: async () => {
    const remote = await pullFromSupabase()
    if (remote === null) {
      set({ supabaseReady: false })
      return
    }
    if (Object.keys(remote).length > 0) {
      for (const [key, entry] of Object.entries(remote)) {
        if (recentlyModified.has(key)) continue
        const localTs = localStorage.getItem("_ts:" + key)
        if (localTs && entry.updatedAt <= localTs) continue
        localStorage.setItem(key, JSON.stringify(entry.value))
        localStorage.setItem("_ts:" + key, entry.updatedAt)
      }
    }
    set({ supabaseReady: true, syncCount: get().syncCount + 1 })
    get().loadGoals()
    get().loadHealth()
    get().loadGym()
    get().loadSleepLog()
    get().loadReminders()
    get().loadTrackedProjects()
  },

  loadGoals: () => {
    let goals = getGoals(todayKey())
    const today = getActiveDateString()
    const yesterday = new Date(today + "T12:00:00")
    for (let i = 1; i <= 7; i++) {
      const d = new Date(yesterday.getTime() - i * 86400000)
      const dateStr = toDateString(d)
      if (dateStr === today) continue
      const dayGoals = getGoals(keyFor(dateStr))
      dayGoals.forEach(g => {
        if (!g.done && !goals.some(e => e.text === g.text)) {
          goals.push({ ...g, pushedCount: (g.pushedCount || 0) + 1 })
        }
      })
    }
    const tomorrowGoals = getGoals(tomorrowKey())
    const streakData = storeGet<{ count: number }>("goal_streak_v1")
    const sleepData = storeGet<number>("last_sleep_hours")
    const sleepTimerData = storeGet<number>("sleep_timer_start")
    const validTimer = typeof sleepTimerData === "number" && (Date.now() - sleepTimerData) < 16 * 60 * 60 * 1000
    if (sleepTimerData && !validTimer) {
      localStorage.removeItem("sleep_timer_start")
      localStorage.removeItem("_ts:sleep_timer_start")
    }
    set({
      goals,
      tomorrowGoals,
      streak: streakData?.count ?? 0,
      sleep: typeof sleepData === "number" ? sleepData : 8,
      sleepTimerStart: validTimer ? sleepTimerData : null,
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
    autoSync()
  },

  toggleGoal: (idx) => {
    const key = todayKey()
    const goals = getGoals(key)
    if (goals[idx]) {
      goals[idx].done = !goals[idx].done
      goals[idx].doneAt = goals[idx].done ? Date.now() : undefined
      storeSet(key, goals)
      set({ goals: [...goals] })
      autoSync()
    }
  },

  deleteGoal: (idx) => {
    const key = todayKey()
    const goals = getGoals(key)
    goals.splice(idx, 1)
    storeSet(key, goals)
    set({ goals: [...goals] })
    autoSync()
  },

  editGoal: (idx, text) => {
    const key = todayKey()
    const goals = getGoals(key)
    if (goals[idx]) {
      goals[idx].text = text
      storeSet(key, goals)
      set({ goals: [...goals] })
      autoSync()
    }
  },

  toggleQueued: (idx) => {
    const key = todayKey()
    const goals = getGoals(key)
    if (goals[idx]) {
      goals[idx].queued = !goals[idx].queued
      storeSet(key, goals)
      set({ goals: [...goals] })
      autoSync()
    }
  },

  reorderGoals: (newOrder) => {
    const key = todayKey()
    storeSet(key, newOrder)
    set({ goals: newOrder })
    autoSync()
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
    autoSync()
  },

  setSleep: (hours) => {
    set({ sleep: hours })
    storeSet("last_sleep_hours", hours)
    autoSync()
  },

  startSleepTimer: async () => {
    const now = Date.now()
    set({ sleepTimerStart: now, lastSleepNotif: now })
    storeSet("sleep_timer_start", now)
    storeSet("sleep_last_notif_v1", now)
    await waitSync()
  },
  stopSleepTimer: async () => {
    const started = get().sleepTimerStart
    const elapsed = started ? Math.round((Date.now() - started) / 60000) : 0
    set({ sleepTimerStart: null })
    storeSet("sleep_timer_start", null)
    if (elapsed > 0) {
      const date = new Date().toISOString().slice(0, 10)
      const log = [...get().sleepLog]
      const existing = log.findIndex(e => e.date === date)
      if (existing >= 0) { log[existing] = { date, minutes: elapsed } }
      else { log.push({ date, minutes: elapsed }) }
      storeSet("sleep_log", log)
      set({ sleepLog: log })
    }
    get().addReminder(`Slept for ${elapsed} min`, "task", 0)
    await waitSync()
  },
  loadSleepLog: () => {
    const log = storeGet<SleepEntry[]>("sleep_log") || []
    set({ sleepLog: log })
  },
  loadReminders: () => {
    const saved = storeGet<Reminder[]>("reminders_v1") || []
    const waterMin = storeGet<number>("water_timer_min_v1") || 45
    const lastNotif = storeGet<number>("water_last_notif_v1") || 0
    const lastSleep = storeGet<number>("sleep_last_notif_v1") || 0
    set({ reminders: saved, waterTimerMin: waterMin, lastWaterNotif: lastNotif, lastSleepNotif: lastSleep })
  },
  loadWeightEntries: () => {
    // WeightTracker reads directly from localStorage; this ensures
    // sync writes the latest remote data before the component reads it
  },

  toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
  setFocusOpen: (open) => set({ focusOpen: open }),
  setCommandPalette: (open) => set({ commandPaletteOpen: open }),
  setAIPanel: (open) => set({ aiPanelOpen: open }),
  setNotificationPanel: (open) => set({ notificationPanelOpen: open }),
  setMobileMenu: (open) => set({ mobileMenuOpen: open }),
  setActivePage: (page) => set({ activePage: page }),

  saveReminders: () => {
    storeSet("reminders_v1", get().reminders)
    autoSync()
  },
  addReminder: (text, type, minutes, goalIdx) => {
    set(s => ({
      reminders: [...s.reminders, {
        id: `rem_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        text, type, goalIdx,
        dueAt: Date.now() + minutes * 60000,
        completed: false,
      }],
    }))
    storeSet("reminders_v1", get().reminders)
    autoSync()
  },
  completeReminder: (id) => {
    set(s => ({
      reminders: s.reminders.map(r => r.id === id ? { ...r, completed: true } : r),
    }))
    storeSet("reminders_v1", get().reminders)
    autoSync()
  },
  deleteReminder: (id) => {
    set(s => ({
      reminders: s.reminders.filter(r => r.id !== id),
    }))
    storeSet("reminders_v1", get().reminders)
    autoSync()
  },
  setWaterTimerMin: (m) => {
    set({ waterTimerMin: m, lastWaterNotif: Date.now() })
    storeSet("water_timer_min_v1", m)
    storeSet("water_last_notif_v1", Date.now())
    autoSync()
  },
  markWaterNotif: () => {
    set({ lastWaterNotif: Date.now() })
    storeSet("water_last_notif_v1", Date.now())
    autoSync()
  },
  markSleepNotif: () => {
    set({ lastSleepNotif: Date.now() })
    storeSet("sleep_last_notif_v1", Date.now())
    autoSync()
  },

  health: { ...defaultHealth },
  loadHealth: () => {
    const saved = storeGet<Partial<HealthState>>("health_dashboard_v1")
    set({ health: { ...defaultHealth, ...saved } })
  },
  updateHealth: (partial) => {
    const health = { ...get().health, ...partial }
    storeSet("health_dashboard_v1", health)
    set({ health })
    autoSync()
  },
  toggleSupp: (key) => {
    const health = { ...get().health, done: { ...get().health.done } }
    health.done[key] = !health.done[key]
    storeSet("health_dashboard_v1", health)
    set({ health })
    autoSync()
  },
  toggleLow: (item) => {
    const health = { ...get().health, low: { ...get().health.low } }
    health.low[item] = !health.low[item]
    storeSet("health_dashboard_v1", health)
    set({ health })
    autoSync()
  },
  addWater: (ml) => {
    const health = { ...get().health, waterMl: (get().health.waterMl || 0) + ml }
    storeSet("health_dashboard_v1", health)
    set({ health })
    autoSync()
  },
  resetWater: () => {
    const health = { ...get().health, waterMl: 0 }
    storeSet("health_dashboard_v1", health)
    set({ health })
    autoSync()
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
    autoSync()
  },
  addLog: (log) => {
    const gym = { ...get().gym, logs: [...get().gym.logs, log] }
    storeSet("gym_dashboard_v1", gym)
    set({ gym })
    autoSync()
  },
  deleteLog: (idx) => {
    const gym = { ...get().gym, logs: get().gym.logs.filter((_, i) => i !== idx) }
    storeSet("gym_dashboard_v1", gym)
    set({ gym })
    autoSync()
  },
  setPhoto: (id, data) => {
    const gym = { ...get().gym, photos: { ...get().gym.photos, [id]: data } }
    storeSet("gym_dashboard_v1", gym)
    set({ gym })
    autoSync()
  },
  addCustomExercise: (name) => {
    const gym = { ...get().gym, customExercises: [...get().gym.customExercises, name] }
    storeSet("gym_dashboard_v1", gym)
    set({ gym })
    autoSync()
  },
  deleteCustomExercise: (name) => {
    const gym = { ...get().gym, customExercises: get().gym.customExercises.filter(e => e !== name) }
    storeSet("gym_dashboard_v1", gym)
    set({ gym })
    autoSync()
  },

  repos: [],
  featuredRepos: storeGet<string[]>("featured_repos") || [],
  currentProject: null,
  trackedProjects: storeGet<TrackedProject[]>("tracked_projects") || [],
  setRepos: (repos) => set({ repos }),
  loadTrackedProjects: () => {
    const tracked = storeGet<TrackedProject[]>("tracked_projects") || []
    const current = tracked.find(t => t.startTime)?.name || null
    set({ trackedProjects: tracked, currentProject: current })
  },
  removeTrackedProject: (name) => {
    const tracked = get().trackedProjects.filter(t => t.name !== name)
    if (get().currentProject === name) {
      set({ currentProject: null })
    }
    storeSet("tracked_projects", tracked)
    set({ trackedProjects: tracked })
    autoSync()
  },
  toggleFeatured: (name) => {
    const featured = get().featuredRepos
    const next = featured.includes(name) ? featured.filter(n => n !== name) : [...featured, name]
    storeSet("featured_repos", next)
    set({ featuredRepos: next })
    autoSync()
  },
  setCurrentProject: (name) => {
    const current = get().currentProject
    const tracked = [...get().trackedProjects]
    if (current && current !== name) {
      const tp = tracked.find(t => t.name === current)
      if (tp && tp.startTime) {
        tp.totalMinutes += Math.round((Date.now() - tp.startTime) / 60000)
        tp.startTime = null
      }
    }
    set({ currentProject: name, trackedProjects: tracked })
    storeSet("tracked_projects", tracked)
    autoSync()
  },
  startTracking: () => {
    const name = get().currentProject
    if (!name) return
    const tracked = [...get().trackedProjects]
    let tp = tracked.find(t => t.name === name)
    if (!tp) { tp = { name, totalMinutes: 0, startTime: null }; tracked.push(tp) }
    tp.startTime = Date.now()
    set({ trackedProjects: tracked })
    storeSet("tracked_projects", tracked)
    autoSync()
  },
  stopTracking: () => {
    const name = get().currentProject
    if (!name) return
    const tracked = [...get().trackedProjects]
    const tp = tracked.find(t => t.name === name)
    if (tp && tp.startTime) {
      tp.totalMinutes += Math.round((Date.now() - tp.startTime) / 60000)
      tp.startTime = null
    }
    set({ trackedProjects: tracked })
    storeSet("tracked_projects", tracked)
    autoSync()
  },

  stockHoldings: [],
  stockQuotes: {},
  stockExpandedSymbol: null,

  mode: (storeGet<"work" | "study">("dashboard_mode")) || "work",
  theme: storeGet<ThemeConfig>("theme_v1") || { mode: "dark", brandColor: "#3bcb85", accentColor: "#748ffc" },

  setMode: (m) => {
    storeSet("dashboard_mode", m)
    set({ mode: m })
    autoSync()
  },
  setTheme: (theme) => {
    storeSet("theme_v1", theme)
    set({ theme })
    applyTheme(theme)
    autoSync()
  },
  lastWorkPath: ROUTES.HOME,
  lastStudyPath: ROUTES.STUDY,
  setLastWorkPath: (path) => set({ lastWorkPath: path }),
  setLastStudyPath: (path) => set({ lastStudyPath: path }),
  studyTasks: [],
  studyStreak: 0,
  loadStudyData: () => {
    const tasks = storeGet<StudyTask[]>("study_tasks_v1") || []
    const streakData = storeGet<{ count: number }>("study_streak_v1")
    set({ studyTasks: tasks, studyStreak: streakData?.count ?? 0 })
  },
  addStudyTask: (text) => {
    const task: StudyTask = {
      id: `st_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      text, done: false, createdAt: Date.now(),
    }
    const tasks = [...get().studyTasks, task]
    storeSet("study_tasks_v1", tasks)
    set({ studyTasks: tasks })
    autoSync()
  },
  toggleStudyTask: (id) => {
    const tasks = get().studyTasks.map(t =>
      t.id === id ? { ...t, done: !t.done } : t
    )
    storeSet("study_tasks_v1", tasks)
    set({ studyTasks: tasks })
    // Update streak when completing a task
    const today = new Date().toISOString().slice(0, 10)
    const doneToday = tasks.filter(t => t.done)
    const streakKey = "study_streak_v1"
    const streakData = storeGet<{ count: number; date: string }>(streakKey) || { count: 0, date: "" }
    if (doneToday.length > 0) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
      if (streakData.date === today) {
        // Already counted today
      } else if (streakData.date === yesterday) {
        streakData.count++
        streakData.date = today
      } else {
        streakData.count = 1
        streakData.date = today
      }
      storeSet(streakKey, streakData)
      set({ studyStreak: streakData.count })
    }
    autoSync()
  },
  deleteStudyTask: (id) => {
    const tasks = get().studyTasks.filter(t => t.id !== id)
    storeSet("study_tasks_v1", tasks)
    set({ studyTasks: tasks })
    autoSync()
  },

  loadStocks: () => {
    const holdings = storeGet<StockHolding[]>("stocks_holdings_v1") || []
    const quotes = storeGet<Record<string, StockQuote>>("stocks_quotes_v1") || {}
    set({ stockHoldings: holdings, stockQuotes: quotes })
  },
  addStock: (symbol, shares, buyPrice) => {
    const holdings = [...get().stockHoldings]
    const existing = holdings.find(h => h.symbol === symbol.toUpperCase())
    if (existing) {
      existing.shares += shares
    } else {
      holdings.push({ symbol: symbol.toUpperCase(), shares, buyPrice, addedAt: Date.now() })
    }
    storeSet("stocks_holdings_v1", holdings)
    set({ stockHoldings: holdings })
    autoSync()
    get().fetchStockQuotes()
  },
  removeStock: (symbol) => {
    const holdings = get().stockHoldings.filter(h => h.symbol !== symbol.toUpperCase())
    storeSet("stocks_holdings_v1", holdings)
    set({ stockHoldings: holdings })
    autoSync()
  },
  setStockExpanded: (symbol) => set({ stockExpandedSymbol: symbol }),
  fetchStockQuotes: async () => {
    const holdings = get().stockHoldings
    if (holdings.length === 0) return
    const symbols = holdings.map(h => h.symbol).join(",")
    try {
      const res = await fetch(`/api/stock/quote?symbols=${symbols}`)
      if (!res.ok) return
      const data = await res.json()
      const quotes = { ...get().stockQuotes, ...data }
      storeSet("stocks_quotes_v1", quotes)
      set({ stockQuotes: quotes })
    } catch {}
  },
}))
