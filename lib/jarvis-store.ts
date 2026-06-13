"use client"

import { create } from "zustand"

import type { JarvisSession, JarvisMessage, JarvisMemory, JarvisDocument, JarvisEndpoint, LLMProvider, JarvisUser } from "./jarvis-types"
import { executeToolCall } from "./jarvis-tools"

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
  regenerate: () => Promise<void>
  editMessage: (messageId: string, newContent: string) => Promise<void>
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
  hydrateFromStorage: () => void
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
  model: typeof window !== "undefined" ? localStorage.getItem("lifeos-jarvis-model") || "llama-3.3-70b-versatile" : "llama-3.3-70b-versatile",
  endpointUrl: typeof window !== "undefined" ? localStorage.getItem("lifeos-jarvis-endpoint") || "https://api.groq.com/openai/v1" : "https://api.groq.com/openai/v1",
  systemPrompt: typeof window !== "undefined" ? localStorage.getItem("lifeos-jarvis-prompt") || "You are J.A.R.V.I.S., an AI assistant." : "You are J.A.R.V.I.S., an AI assistant.",
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

    // Optimistically add user message
    const userMsg: JarvisMessage = {
      id: `temp-${Date.now()}`,
      session_id: currentSessionId,
      role: "user",
      content: message,
      metadata: { model },
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
      let finishReason: string | null = null
      let pendingToolCall: { id: string; name: string; arguments: Record<string, unknown> } | null = null

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
            if (parsed.type === "tool_call") {
              pendingToolCall = { id: parsed.id, name: parsed.name, arguments: parsed.arguments || {} }
            }
            if (parsed.type === "finish_reason") {
              finishReason = parsed.reason
            }
          } catch {}
        }
      }

      // Handle tool call if present
      if (pendingToolCall) {
        // Add any streamed text as assistant message first
        if (fullText) {
          const partialMsg: JarvisMessage = {
            id: `msg-${Date.now()}`,
            session_id: currentSessionId,
            role: "assistant",
            content: fullText,
            metadata: { model, finish_reason: finishReason || undefined },
            created_at: new Date().toISOString(),
          }
          set((s) => ({ messages: [...s.messages, partialMsg] }))
        }

        // Execute the tool
        const result = executeToolCall({ id: pendingToolCall.id, name: pendingToolCall.name, arguments: pendingToolCall.arguments })

        // Show tool result as a system message in the UI
        const toolMsg: JarvisMessage = {
          id: `tool-${Date.now()}`,
          session_id: currentSessionId,
          role: "system",
          content: `🛠 ${pendingToolCall.name}: ${result}`,
          metadata: { model },
          created_at: new Date().toISOString(),
        }
        set((s) => ({ messages: [...s.messages, toolMsg] }))

        // Send follow-up request with tool result
        const followUp = await fetch("/api/jarvis/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: currentSessionId,
            message: "(Tool result follow-up)",
            model,
            endpointUrl,
            systemPrompt,
            toolResult: {
              toolCallId: pendingToolCall.id,
              result,
            },
          }),
          signal: abortController.signal,
        })

        if (!followUp.ok) {
          const err = await followUp.json()
          set({ error: err.error || "Tool follow-up failed", chatLoading: false })
          return
        }

        const reader2 = followUp.body?.getReader()
        if (!reader2) {
          set({ error: "No response body", chatLoading: false })
          return
        }

        let followUpText = ""
        let buffer2 = ""
        while (true) {
          const { done, value } = await reader2.read()
          if (done) break
          buffer2 += decoder.decode(value, { stream: true })
          const lines = buffer2.split("\n")
          buffer2 = lines.pop() || ""
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
                followUpText += parsed.delta
                set({ streamingText: followUpText })
              }
            } catch {}
          }
        }

        if (followUpText) {
          const finalMsg: JarvisMessage = {
            id: `msg-${Date.now()}`,
            session_id: currentSessionId,
            role: "assistant",
            content: followUpText,
            metadata: { model, finish_reason: finishReason || undefined },
            created_at: new Date().toISOString(),
          }
          set((s) => ({ messages: [...s.messages, finalMsg], streamingText: "" }))
        }
        set({ chatLoading: false })
        return
      }

      // Add assistant message (no tool call)
      if (fullText) {
        const assistantMsg: JarvisMessage = {
          id: `msg-${Date.now()}`,
          session_id: currentSessionId,
          role: "assistant",
          content: fullText,
          metadata: { model, finish_reason: finishReason || undefined },
          created_at: new Date().toISOString(),
        }
        set((s) => ({ messages: [...s.messages, assistantMsg], streamingText: "" }))
      }
      // Reload sessions to pick up auto-title
      get().loadSessions()
      } catch (err) {
      if ((err as Error).name !== "AbortError") {
        set({ error: (err as Error).message, chatLoading: false })
      }
    }
    set({ chatLoading: false })
  },

  regenerate: async () => {
    const { currentSessionId, model, endpointUrl, systemPrompt, mode, messages } = get()
    if (!currentSessionId) return

    // Find last user message
    const lastUserIdx = [...messages].reverse().findIndex(m => m.role === "user")
    if (lastUserIdx === -1) return
    const lastUserMsg = [...messages].reverse()[lastUserIdx]

    // Truncate messages after last user message
    const userMsgIndex = messages.indexOf(lastUserMsg)
    set({ messages: messages.slice(0, userMsgIndex + 1), chatLoading: true, streamingText: "", error: null })

    try {
      abortController = new AbortController()
      const res = await fetch("/api/jarvis/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: currentSessionId,
          message: lastUserMsg.content,
          model,
          endpointUrl,
          systemPrompt,
          mode,
          regenerate: true,
        }),
        signal: abortController.signal,
      })

      if (!res.ok) {
        const err = await res.json()
        set({ error: err.error || "Regenerate failed", chatLoading: false })
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
      let finishReason: string | null = null
      let pendingToolCall: { id: string; name: string; arguments: Record<string, unknown> } | null = null

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
            if (parsed.type === "tool_call") {
              pendingToolCall = { id: parsed.id, name: parsed.name, arguments: parsed.arguments || {} }
            }
            if (parsed.type === "finish_reason") {
              finishReason = parsed.reason
            }
          } catch {}
        }
      }

      if (pendingToolCall) {
        if (fullText) {
          const partialMsg: JarvisMessage = {
            id: `msg-${Date.now()}`,
            session_id: currentSessionId,
            role: "assistant",
            content: fullText,
            metadata: { model, finish_reason: finishReason || undefined },
            created_at: new Date().toISOString(),
          }
          set((s) => ({ messages: [...s.messages, partialMsg] }))
        }
        const result = executeToolCall({ id: pendingToolCall.id, name: pendingToolCall.name, arguments: pendingToolCall.arguments })
        const toolMsg: JarvisMessage = {
          id: `tool-${Date.now()}`,
          session_id: currentSessionId,
          role: "system",
          content: `🛠 ${pendingToolCall.name}: ${result}`,
          metadata: { model },
          created_at: new Date().toISOString(),
        }
        set((s) => ({ messages: [...s.messages, toolMsg] }))

        const followUp = await fetch("/api/jarvis/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: currentSessionId,
            message: "(Tool result follow-up)",
            model,
            endpointUrl,
            systemPrompt,
            toolResult: { toolCallId: pendingToolCall.id, result },
          }),
          signal: abortController.signal,
        })
        if (!followUp.ok) {
          const err = await followUp.json()
          set({ error: err.error || "Tool follow-up failed", chatLoading: false })
          return
        }
        const reader2 = followUp.body?.getReader()
        if (reader2) {
          let followUpText = ""
          let buffer2 = ""
          let followUpFinishReason: string | null = null
          while (true) {
            const { done, value } = await reader2.read()
            if (done) break
            buffer2 += decoder.decode(value, { stream: true })
            const lines = buffer2.split("\n")
            buffer2 = lines.pop() || ""
            for (const line of lines) {
              if (!line.startsWith("data: ")) continue
              const data = line.replace("data: ", "").trim()
              if (data === "[DONE]") continue
              try {
                const parsed = JSON.parse(data)
                if (parsed.error) { set({ error: parsed.error, chatLoading: false }); return }
                if (parsed.delta) { followUpText += parsed.delta; set({ streamingText: followUpText }) }
                if (parsed.type === "finish_reason") { followUpFinishReason = parsed.reason }
              } catch {}
            }
          }
          if (followUpText) {
            set((s) => ({
              messages: [...s.messages, { id: `msg-${Date.now()}`, session_id: currentSessionId, role: "assistant", content: followUpText, metadata: { model, finish_reason: followUpFinishReason || undefined }, created_at: new Date().toISOString() }],
              streamingText: "",
            }))
          }
        }
        set({ chatLoading: false })
        return
      }

      if (fullText) {
        const assistantMsg: JarvisMessage = {
          id: `msg-${Date.now()}`,
          session_id: currentSessionId,
          role: "assistant",
          content: fullText,
          metadata: { model, finish_reason: finishReason || undefined },
          created_at: new Date().toISOString(),
        }
        set((s) => ({ messages: [...s.messages, assistantMsg], streamingText: "" }))
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        set({ error: (err as Error).message })
      }
    }
    set({ chatLoading: false })
  },

  editMessage: async (messageId, newContent) => {
    const { currentSessionId, messages } = get()
    if (!currentSessionId) return

    const msgIndex = messages.findIndex(m => m.id === messageId)
    if (msgIndex === -1) return

    // Persist edit to server, then truncate subsequent messages
    try {
      await fetch("/api/jarvis/messages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId, content: newContent, sessionId: currentSessionId }),
      })
    } catch {}

    // Update locally and truncate subsequent
    const updatedMsg = { ...messages[msgIndex], content: newContent }
    set({ messages: [...messages.slice(0, msgIndex), updatedMsg] })

    // Send edited message as new user message for a fresh response
    await get().sendMessage(newContent)
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

  setModel: (model) => { localStorage.setItem("lifeos-jarvis-model", model); set({ model }) },
  setEndpointUrl: (endpointUrl) => { localStorage.setItem("lifeos-jarvis-endpoint", endpointUrl); set({ endpointUrl }) },
  setSystemPrompt: (prompt) => { localStorage.setItem("lifeos-jarvis-prompt", prompt); set({ systemPrompt: prompt }) },
  hydrateFromStorage: () => {
    const model = localStorage.getItem("lifeos-jarvis-model") || "llama-3.3-70b-versatile"
    const endpointUrl = localStorage.getItem("lifeos-jarvis-endpoint") || "https://api.groq.com/openai/v1"
    const systemPrompt = localStorage.getItem("lifeos-jarvis-prompt") || "You are J.A.R.V.I.S., an AI assistant."
    set({ model, endpointUrl, systemPrompt })
  },
  setMode: (mode) => set({ mode }),
  setProviders: (providers) => set({ providers }),
}))
