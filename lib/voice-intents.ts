"use client"

import { startListening, speakText } from "./voice"
import { useStore } from "./store"
import { ROUTES } from "./routes"

export interface IntentMatch {
  intent: string
  confidence: number
  params: Record<string, string>
  matchedText?: string
}

export interface CommandResult {
  success: boolean
  message: string
  action?: string
  jarvisAction?: { type: string; params: Record<string, any> }
}

function gatherLifeContext(): string {
  const today = new Date().toISOString().slice(0, 10)
  const lines: string[] = []

  try {
    const goals: any[] = JSON.parse(localStorage.getItem("goals:" + today) || "[]")
    const done = goals.filter(g => g.done).length
    const pending = goals.filter(g => !g.done)
    lines.push(`Goals: ${done}/${goals.length} done today. Pending: ${pending.map(g => g.text).join(", ") || "none"}`)
  } catch {}

  try {
    const h: any = JSON.parse(localStorage.getItem("health_dashboard_v1") || "{}")
    const waterPct = Math.min(100, Math.round((h.waterMl || 0) / 2000 * 100))
    lines.push(`Health: Water ${waterPct}%, Supplements taken: ${Object.values(h.done || {}).filter(Boolean).length}`)
  } catch {}

  try {
    const g: any = JSON.parse(localStorage.getItem("gym_dashboard_v1") || "{}")
    if (g.logs) {
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10)
      const sessions = new Set(g.logs.filter((l: any) => l.at >= weekAgo).map((l: any) => l.at.slice(0, 10))).size
      lines.push(`Gym: ${sessions} sessions this week`)
    }
  } catch {}

  try {
    const sh = JSON.parse(localStorage.getItem("last_sleep_hours") || '"no data"')
    if (typeof sh === "number") lines.push(`Sleep: ${sh}h average`)
    const log: any[] = JSON.parse(localStorage.getItem("sleep_log") || "[]")
    if (log.length > 0) {
      const last = Math.round((log[log.length - 1].minutes || 0) / 6) / 10
      lines.push(`Last sleep: ${last}h`)
    }
  } catch {}

  try {
    const hab: any[] = JSON.parse(localStorage.getItem("lifeos_habits") || "[]")
    const doneToday = hab.filter((h: any) => (h.logs || []).includes(today)).length
    const streaks = hab.filter((h: any) => (h.streak || 0) > 0).map(h => `${h.name} ${h.streak}d`).join(", ")
    lines.push(`Habits: ${doneToday}/${hab.length} done today${streaks ? `. Streaks: ${streaks}` : ""}`)
  } catch {}

  try {
    const chapters: any[] = JSON.parse(localStorage.getItem("lifeos_chapters") || "[]")
    const completed = chapters.filter(c => c.completed).length
    if (chapters.length > 0) lines.push(`Learning: ${completed}/${chapters.length} chapters completed`)
  } catch {}

  try {
    const journal: any[] = JSON.parse(localStorage.getItem("lifeos_journal") || "[]")
    lines.push(`Journal: ${journal.length} total entries`)
  } catch {}

  try {
    const decisions: any[] = JSON.parse(localStorage.getItem("lifeos_decisions") || "[]")
    if (decisions.length > 0) {
      const pos = decisions.filter(d => d.outcome === "positive").length
      lines.push(`Decisions: ${decisions.length} tracked, ${Math.round(pos / decisions.length * 100)}% positive`)
    }
  } catch {}

  const hour = new Date().getHours()
  const tod = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening"
  lines.unshift(`Time: ${tod}, ${new Date().toLocaleDateString()}`)

  return lines.join("\n")
}

function executeJarvisAction(action: { type: string; params: Record<string, any> }): { message: string; route?: string } {
  const store = useStore.getState()
  const today = new Date().toISOString().slice(0, 10)

  switch (action.type) {
    case "addGoal": {
      const text = action.params?.text || action.params?.goal || ""
      if (!text) return { message: "What goal should I add?" }
      store.addGoal(text)
      return { message: `Goal added: ${text}` }
    }

    case "completeGoal": {
      const text = action.params?.text || action.params?.goal || ""
      if (!text) return { message: "Which goal did you complete?" }
      try {
        const goals: any[] = JSON.parse(localStorage.getItem("goals:" + today) || "[]")
        const search = text.toLowerCase()
        const idx = goals.findIndex((g: any) => !g.done && g.text.toLowerCase().includes(search))
        if (idx >= 0) {
          store.toggleGoal(idx)
          return { message: `Completed: ${goals[idx].text}!` }
        }
        const fuzzy = goals.findIndex((g: any) => !g.done && search.split(" ").some((w: string) => w.length > 2 && g.text.toLowerCase().includes(w)))
        if (fuzzy >= 0) {
          store.toggleGoal(fuzzy)
          return { message: `Completed: ${goals[fuzzy].text}!` }
        }
        return { message: `No pending goal matching "${text}".` }
      } catch { return { message: "Could not access goals." } }
    }

    case "logHabit": {
      const name = action.params?.name || ""
      if (!name) return { message: "Which habit?" }
      try {
        const habits: any[] = JSON.parse(localStorage.getItem("lifeos_habits") || "[]")
        const search = name.toLowerCase()
        const habit = habits.find((h: any) => h.name.toLowerCase().includes(search))
        if (!habit) return { message: `No habit named "${name}".` }
        const logged = (habit.logs || []).includes(today)
        const logs = logged ? (habit.logs || []).filter((d: string) => d !== today) : [...(habit.logs || []), today]
        const streak = logged ? 0 : (habit.streak || 0) + 1
        habit.logs = logs
        habit.streak = streak
        localStorage.setItem("lifeos_habits", JSON.stringify(habits))
        return { message: logged ? `Unchecked ${habit.name}.` : `Checked ${habit.name}! Streak: ${streak}d` }
      } catch { return { message: "Could not toggle habit." } }
    }

    case "addHabit": {
      const name = action.params?.name || ""
      if (!name) return { message: "What habit should I create?" }
      try {
        const habits: any[] = JSON.parse(localStorage.getItem("lifeos_habits") || "[]")
        habits.push({ id: `hab_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, name, category: "health", streak: 0, logs: [], createdAt: Date.now() })
        localStorage.setItem("lifeos_habits", JSON.stringify(habits))
        return { message: `Habit created: ${name}` }
      } catch { return { message: `Could not create habit ${name}.` } }
    }

    case "logWater": {
      const ml = action.params?.ml || 250
      store.addWater(ml)
      return { message: `Added ${ml}ml of water.` }
    }

    case "logWorkout": {
      const duration = action.params?.duration || 45
      store.addLog({ at: new Date().toISOString(), type: "other", exercises: [], notes: "", duration: Math.min(duration, 180) } as any)
      return { message: `Workout logged: ${Math.min(duration, 180)} min.`, route: ROUTES.GYM }
    }

    case "startSleepTimer": {
      store.startSleepTimer()
      return { message: "Sleep timer started. Rest well!" }
    }

    case "stopSleepTimer": {
      store.stopSleepTimer()
      const log = store.sleepLog
      const last = log[log.length - 1]
      const hours = last ? Math.round(last.minutes / 6) / 10 : null
      return { message: hours ? `You slept about ${hours} hours. Good morning!` : "Sleep timer stopped." }
    }

    case "logJournal": {
      const content = action.params?.content || ""
      const mood = action.params?.mood || "neutral"
      if (!content) return { message: "What would you like to journal about?" }
      try {
        const journal: any[] = JSON.parse(localStorage.getItem("lifeos_journal") || "[]")
        const moodEmoji: Record<string, string> = { great: "😄", good: "🙂", neutral: "😐", bad: "😔", awful: "😢" }
        journal.unshift({ id: `j_${Date.now()}`, content, mood, emoji: moodEmoji[mood] || "😐", tags: [], createdAt: Date.now(), date: today })
        localStorage.setItem("lifeos_journal", JSON.stringify(journal))
        return { message: "Journal entry saved." }
      } catch { return { message: "Could not save journal entry." } }
    }

    case "logStudy": {
      const topic = action.params?.topic || ""
      if (!topic) return { message: "What topic did you study?" }
      try {
        const chapters: any[] = JSON.parse(localStorage.getItem("lifeos_chapters") || "[]")
        const idx = chapters.findIndex((c: any) => !c.completed && c.name.toLowerCase().includes(topic.toLowerCase()))
        if (idx >= 0) {
          chapters[idx].completed = true
          chapters[idx].date = today
          localStorage.setItem("lifeos_chapters", JSON.stringify(chapters))
          return { message: `Completed: ${chapters[idx].name}!` }
        }
        chapters.unshift({ id: `ch_${Date.now()}`, subject: "General", name: topic, completed: true, score: null, date: today })
        localStorage.setItem("lifeos_chapters", JSON.stringify(chapters))
        return { message: `Logged study: ${topic}.` }
      } catch { return { message: "Could not log study." } }
    }

    case "navigate": {
      const pages: Record<string, string> = {
        home: ROUTES.HOME, dashboard: ROUTES.HOME, gym: ROUTES.GYM, sleep: ROUTES.SLEEP, journal: ROUTES.JOURNAL,
        habits: ROUTES.HABITS, stocks: ROUTES.STOCKS, health: ROUTES.HEALTH, study: ROUTES.STUDY,
        learning: ROUTES.LEARNING, missions: ROUTES.MISSIONS, decisions: ROUTES.DECISIONS,
        timeline: ROUTES.TIMELINE, brain: ROUTES.BRAIN, reviews: ROUTES.REVIEWS,
        projects: ROUTES.PROJECTS, weight: ROUTES.WEIGHT, voice: ROUTES.VOICE,
        briefings: ROUTES.BRIEFINGS, memory: ROUTES.MEMORY, correlations: ROUTES.CORRELATIONS,
        future: ROUTES.FUTURE, report: ROUTES.REPORT, jarvis: ROUTES.ODYSSEY,
      }
      const page = (action.params?.page || "").toLowerCase()
      const route = pages[page] || (page ? `/${page}` : ROUTES.HOME)
      return { message: `Opening ${page}...`, route }
    }

    case "addReminder": {
      const text = action.params?.text || ""
      if (!text) return { message: "What should I remind you about?" }
      store.addReminder(text, "task", 30)
      return { message: `Reminder set: ${text}` }
    }

    case "setSleep": {
      const hours = action.params?.hours || 8
      store.setSleep(hours)
      return { message: `Sleep logged: ${hours} hours.` }
    }

    case "toggleSupp": {
      const key = action.params?.key || ""
      if (key) {
        store.toggleSupp(key)
        return { message: `Supplement toggled: ${key}` }
      }
      return { message: "Which supplement?" }
    }

    default:
      return { message: `Unknown action: ${action.type}` }
  }
}

export async function processVoiceCommand(text?: string): Promise<CommandResult> {
  const input = text || (await startListening())
  if (!input || input.length < 2) {
    return { success: false, message: "I didn't hear anything. Try again?" }
  }

  const lifeContext = gatherLifeContext()

  try {
    const res = await fetch("/api/jarvis/voice/command", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: input, lifeContext }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "API error" }))
      return { success: false, message: err.error || "Could not reach JARVIS." }
    }

    const data = await res.json()
    const message = data.message || "Got it."
    const jarvisAction = data.action || null

    if (jarvisAction && jarvisAction.type) {
      const result = executeJarvisAction(jarvisAction)
      const fullMessage = result.route
        ? `${message} ${result.message}`
        : `${message} ${result.message}`
      return {
        success: true,
        message: fullMessage,
        action: result.route || undefined,
        jarvisAction,
      }
    }

    return { success: true, message, jarvisAction: undefined }
  } catch (e: any) {
    return { success: false, message: `Couldn't reach JARVIS. ${e.message || ""}` }
  }
}

export function getIntentDescriptions(): { id: string; description: string; example: string }[] {
  return [
    { id: "natural", description: "Just talk naturally", example: '"add a goal to study physics"' },
    { id: "natural", description: "Ask questions", example: '"how did I sleep last night?"' },
    { id: "natural", description: "Give commands", example: '"log a workout at the gym"' },
    { id: "natural", description: "Track habits", example: '"check my reading habit"' },
    { id: "natural", description: "Journal", example: '"journal: today was productive"' },
    { id: "natural", description: "Navigate", example: '"go to sleep tracker"' },
  ]
}
