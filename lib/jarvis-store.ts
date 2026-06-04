"use client"

import { create } from "zustand"
import type { Goal, GymState, Habit, HealthState } from "./types"
import type { JarvisSession, JarvisMessage, JarvisMemory, JarvisDocument, JarvisEndpoint, LLMProvider, JarvisUser } from "./jarvis-types"

interface JarvisState {
  // Auth
  user: JarvisUser | null
  isAuthenticated: boolean
  authLoading: boolean

  // Sessions
  sessions: JarvisSession[]
  currentSessionId: string | null
  messages: JarvisMessage[]
  sessionsLoading: boolean

  // Chat
  chatLoading: boolean
  streamingText: string
  error: string | null

  // Memory
  memories: JarvisMemory[]
  memoriesLoading: boolean

  // Documents
  documents: JarvisDocument[]
  documentsLoading: boolean

  // Settings
  model: string
  endpointUrl: string
  systemPrompt: string
  mode: "chat" | "agent" | "research"
  providers: LLMProvider[]
  endpoints: JarvisEndpoint[]

  // Actions
  login: (username: string, password: string, rememberMe?: boolean) => Promise<void>
  signup: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>

  loadSessions: () => Promise<void>
  createSession: (opts?: Partial<JarvisSession>) => Promise<string>
  selectSession: (id: string | null) => Promise<void>
  deleteSession: (id: string) => Promise<void>
  updateSession: (id: string, updates: Partial<JarvisSession>) => Promise<void>

  loadMessages: (sessionId: string) => Promise<void>
  sendMessage: (message: string) => Promise<void>
  cancelStream: () => void

  loadMemories: () => Promise<void>
  addMemory: (text: string, category?: string) => Promise<void>
  deleteMemory: (id: string) => Promise<void>
  togglePinMemory: (id: string, pinned: boolean) => Promise<void>

  loadDocuments: () => Promise<void>
  createDocument: (title: string, content?: string, language?: string) => Promise<void>
  deleteDocument: (id: string) => Promise<void>

  setModel: (model: string) => void
  setEndpointUrl: (url: string) => void
  setSystemPrompt: (prompt: string) => void
  setMode: (mode: "chat" | "agent" | "research") => void
  setProviders: (providers: LLMProvider[]) => void
}

let abortController: AbortController | null = null

export const useJarvisStore = create<JarvisState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  authLoading: true,
  sessions: [],
  currentSessionId: null,
  messages: [],
  sessionsLoading: false,
  chatLoading: false,
  streamingText: "",
  error: null,
  memories: [],
  memoriesLoading: false,
  documents: [],
  documentsLoading: false,
  model: "llama-3.3-70b-versatile",
  endpointUrl: "https://api.groq.com/openai/v1",
  systemPrompt: "You are J.A.R.V.I.S., an AI assistant. Be concise, helpful, and use the user's context to provide personalized responses.",
  mode: "chat",
  providers: [],
  endpoints: [],

  login: async (username, password, rememberMe = false) => {
    const res = await fetch("/api/jarvis/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, rememberMe }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || "Login failed")
    }
    const data = await res.json()
    set({ user: data.user, isAuthenticated: true, authLoading: false })
    await get().loadSessions()
    await get().loadMemories()
    // Auto-create first session if none exist
    if (get().sessions.length === 0) {
      await get().createSession({ name: "General" })
    }
  },

  signup: async (username, password) => {
    const res = await fetch("/api/jarvis/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || "Signup failed")
    }
    const data = await res.json()
    set({ user: data.user, isAuthenticated: true, authLoading: false })
    await get().loadSessions()
    await get().loadMemories()
    // Auto-create first session if none exist
    if (get().sessions.length === 0) {
      await get().createSession({ name: "General" })
    }
  },

  logout: async () => {
    await fetch("/api/jarvis/auth/logout", { method: "POST" })
    set({ user: null, isAuthenticated: false, sessions: [], messages: [], currentSessionId: null })
  },

  checkAuth: async () => {
    try {
      const res = await fetch("/api/jarvis/auth/status")
      const data = await res.json()
      if (data.authenticated) {
        set({
          isAuthenticated: true,
          authLoading: false,
          user: { id: data.userId, username: data.username, is_admin: data.isAdmin, privileges: {}, created_at: "" },
        })
        await get().loadSessions()
        await get().loadMemories()
        // Auto-create first session if none exist
        if (get().sessions.length === 0) {
          await get().createSession({ name: "General" })
        }
        return
      }
    } catch {}
    set({ isAuthenticated: false, authLoading: false })
  },

  loadSessions: async () => {
    try {
      set({ sessionsLoading: true })
      const res = await fetch("/api/jarvis/sessions")
      const data = await res.json()
      set({ sessions: data.sessions || [], sessionsLoading: false })
    } catch {
      set({ sessionsLoading: false })
    }
  },

  createSession: async (opts) => {
    try {
      const res = await fetch("/api/jarvis/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(opts || {}),
      })
      const data = await res.json()
      set((s) => ({ sessions: [data.session, ...s.sessions], currentSessionId: data.session.id, messages: [] }))
      return data.session.id
    } catch { return "" }
  },

  selectSession: async (id) => {
    set({ currentSessionId: id, messages: [], error: null })
    if (id) {
      await get().loadMessages(id)
    }
  },

  deleteSession: async (id) => {
    await fetch("/api/jarvis/sessions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    set((s) => {
      const sessions = s.sessions.filter((s) => s.id !== id)
      const currentSessionId = s.currentSessionId === id ? null : s.currentSessionId
      return { sessions, currentSessionId, messages: currentSessionId ? s.messages : [] }
    })
  },

  updateSession: async (id, updates) => {
    await fetch("/api/jarvis/sessions", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    })
    set((s) => ({
      sessions: s.sessions.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }))
  },

  loadMessages: async (sessionId) => {
    try {
      const res = await fetch(`/api/jarvis/messages?sessionId=${sessionId}`)
      const data = await res.json()
      set({ messages: data.messages || [] })
    } catch {}
  },

  sendMessage: async (message) => {
    const { currentSessionId, model, endpointUrl, systemPrompt, mode } = get()
    if (!currentSessionId) return

    set({ chatLoading: true, streamingText: "", error: null })

    // Gather LifeOS context for personal assistant
    let lifeContext = ""
    if (typeof window !== "undefined") {
      try {
        const today = new Date().toISOString().slice(0, 10)
        const hour = new Date().getHours()
        const timeOfDay = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening"
        const goals: Goal[] = JSON.parse(localStorage.getItem("goals:" + today) || "[]")
        const health: HealthState = JSON.parse(localStorage.getItem("health_dashboard_v1") || "{}")
        const gym: GymState = JSON.parse(localStorage.getItem("gym_dashboard_v1") || "{}")
        const sleepHrs = JSON.parse(localStorage.getItem("last_sleep_hours") || "8")
        const habits: Habit[] = JSON.parse(localStorage.getItem("lifeos_habits") || "[]")
        const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10)
        const tomorrowGoals: Goal[] = JSON.parse(localStorage.getItem("goals:" + tomorrow) || "[]")

        lifeContext = [
          `Current time: ${timeOfDay}`,
          `Goals today: ${goals.filter((g: Goal) => g.done).length}/${goals.length}`,
          `Water: ${Math.round((health.waterMl || 0) / 2000 * 100)}% of target`,
          `Gym sessions this week: ${new Set((gym.logs || []).filter((l: GymState["logs"][0]) => new Date(l.at).getTime() > Date.now() - 604800000).map((l: GymState["logs"][0]) => new Date(l.at).toISOString().slice(0, 10))).size}`,
          `Sleep: ${typeof sleepHrs === "number" ? sleepHrs : 8}h average`,
          `Habits done today: ${habits.filter((h: Habit) => h.logs?.includes(today)).length}/${habits.length}`,
          `Habits longest streak: ${Math.max(0, ...habits.map((h: Habit) => h.streak || 0))}d`,
          tomorrowGoals.length > 0 ? `Goals for tomorrow: ${tomorrowGoals.filter((g: Goal) => !g.done).length}` : "",
        ].filter(Boolean).join("\n")
      } catch {}
    }

    // Optimistically add user message
    const userMsg: JarvisMessage = {
      id: `temp-${Date.now()}`,
      session_id: currentSessionId,
      role: "user",
      content: message,
      metadata: {},
      created_at: new Date().toISOString(),
    }
    set((s) => ({ messages: [...s.messages, userMsg] }))

    try {
      abortController = new AbortController()
      const res = await fetch("/api/jarvis/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: currentSessionId,
          message,
          model,
          endpointUrl,
          systemPrompt,
          mode,
          lifeContext,
        }),
        signal: abortController.signal,
      })

      if (!res.ok) {
        const err = await res.json()
        set({ error: err.error || "Chat failed", chatLoading: false })
        return
      }

      const reader = res.body?.getReader()
      if (!reader) {
        set({ error: "No response body", chatLoading: false })
        return
      }

      const decoder = new TextDecoder()
      let fullText = ""
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() || ""

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue
          const data = line.replace("data: ", "").trim()
          if (data === "[DONE]") continue
          try {
            const parsed = JSON.parse(data)
            if (parsed.error) {
              set({ error: parsed.error, chatLoading: false })
              return
            }
            if (parsed.delta) {
              fullText += parsed.delta
              set({ streamingText: fullText })
            }
          } catch {}
        }
      }

      // Add assistant message
      if (fullText) {
        const assistantMsg: JarvisMessage = {
          id: `msg-${Date.now()}`,
          session_id: currentSessionId,
          role: "assistant",
          content: fullText,
          metadata: {},
          created_at: new Date().toISOString(),
        }
        set((s) => ({ messages: [...s.messages, assistantMsg], streamingText: "" }))
      }
      } catch (err) {
      if ((err as Error).name !== "AbortError") {
        set({ error: (err as Error).message, chatLoading: false })
      }
    }
    set({ chatLoading: false })
  },

  cancelStream: () => {
    if (abortController) {
      abortController.abort()
      abortController = null
    }
    set({ chatLoading: false })
  },

  loadMemories: async () => {
    try {
      set({ memoriesLoading: true })
      const res = await fetch("/api/jarvis/memories")
      const data = await res.json()
      set({ memories: data.memories || [], memoriesLoading: false })
    } catch {
      set({ memoriesLoading: false })
    }
  },

  addMemory: async (text, category) => {
    await fetch("/api/jarvis/memories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, category: category || "fact" }),
    })
    get().loadMemories()
  },

  deleteMemory: async (id) => {
    await fetch("/api/jarvis/memories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    set((s) => ({ memories: s.memories.filter((m) => m.id !== id) }))
  },

  togglePinMemory: async (id, pinned) => {
    await fetch("/api/jarvis/memories", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, pinned }),
    })
    set((s) => ({
      memories: s.memories.map((m) => (m.id === id ? { ...m, is_pinned: pinned } : m)),
    }))
  },

  loadDocuments: async () => {
    try {
      set({ documentsLoading: true })
      const res = await fetch("/api/jarvis/documents")
      const data = await res.json()
      set({ documents: data.documents || [], documentsLoading: false })
    } catch {
      set({ documentsLoading: false })
    }
  },

  createDocument: async (title, content, language) => {
    await fetch("/api/jarvis/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content: content || "", language }),
    })
    get().loadDocuments()
  },

  deleteDocument: async (id) => {
    await fetch("/api/jarvis/documents", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    set((s) => ({ documents: s.documents.filter((d) => d.id !== id) }))
  },

  setModel: (model) => set({ model }),
  setEndpointUrl: (endpointUrl) => set({ endpointUrl }),
  setSystemPrompt: (prompt) => set({ systemPrompt: prompt }),
  setMode: (mode) => set({ mode }),
  setProviders: (providers) => set({ providers }),
}))
