"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useJarvisStore } from "@/lib/jarvis-store"
import { Bot, Send, Plus, Trash2, Menu, X, MessageSquare, Lightbulb, Brain, Zap, Loader2, ChevronDown, PanelLeftClose, PanelLeft, Pencil, Check, Settings, Search, Archive, Star, LogOut, UserPlus, LogIn, Copy, CheckCheck, RefreshCw, ThumbsUp, ThumbsDown, Volume2, Mic, Play } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import type { Components } from "react-markdown"
import JarvisVoiceInput from "./JarvisVoiceInput"
import JarvisVoicePlaybackBar from "./JarvisVoicePlaybackBar"
import { useJarvisVoice } from "@/lib/use-jarvis-voice"

// ---- Premium streaming indicator ----
function TypingDots() {
  return (
    <div className="flex items-center gap-3 pl-2">
      <div className="flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-accent/40 animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-2 h-2 rounded-full bg-accent/40 animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-2 h-2 rounded-full bg-accent/40 animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
      <span className="text-[11px] text-text-tertiary font-medium">JARVIS is thinking</span>
    </div>
  )
}

// ---- Scroll-to-bottom button ----
function ScrollToBottomBtn({ visible, onClick }: { visible: boolean; onClick: () => void }) {
  if (!visible) return null
  return (
    <button
      onClick={onClick}
      className="absolute bottom-4 right-6 z-10 w-9 h-9 rounded-full glass-strong flex items-center justify-center shadow-lg hover:bg-white/10 transition-all"
    >
      <ChevronDown size={16} className="text-text-secondary" />
    </button>
  )
}

function CodeBlock({ className, children }: { className?: string; children?: React.ReactNode }) {
  const [copied, setCopied] = useState(false)
  const language = className?.replace("language-", "") || ""
  const code = String(children).replace(/\n$/, "")

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [code])

  return (
    <div className="relative group my-3">
      <div className="flex items-center justify-between px-4 py-1.5 rounded-t-lg bg-white/[0.06] border border-white/[0.08] border-b-0">
        <span className="text-[11px] font-mono text-text-tertiary">{language || "code"}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium text-text-tertiary hover:text-text-secondary hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100"
        >
          {copied ? <CheckCheck size={12} /> : <Copy size={12} />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="!mt-0 !rounded-t-none !border-t-0 !bg-white/[0.03] overflow-x-auto">
        <code className={className}>{code}</code>
      </pre>
    </div>
  )
}

const markdownComponents: Components = {
  code({ className, children, ...props }) {
    const isInline = !className || !className.includes("language-")
    if (isInline) {
      return <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs font-mono text-white/80" {...props}>{children}</code>
    }
    return <CodeBlock className={className}>{children}</CodeBlock>
  },
  table({ children }) {
    return (
      <div className="overflow-x-auto my-3">
        <table className="w-full border-collapse text-sm">{children}</table>
      </div>
    )
  },
  th({ children }) {
    return <th className="border border-white/10 bg-white/[0.04] px-3 py-2 text-left text-xs font-semibold text-white/70">{children}</th>
  },
  td({ children }) {
    return <td className="border border-white/10 px-3 py-2 text-xs text-white/70 [&:nth-child(even)]:bg-white/[0.02]">{children}</td>
  },
  blockquote({ children }) {
    return <blockquote className="border-l-2 border-brand pl-4 my-2 text-white/60 italic">{children}</blockquote>
  },
  a({ href, children }) {
    return <a href={href} target="_blank" rel="noopener noreferrer" className="text-brand underline underline-offset-2 hover:opacity-80">{children}</a>
  },
  ul({ children }) {
    return <ul className="list-disc pl-5 my-2 space-y-1 text-white/80">{children}</ul>
  },
  ol({ children }) {
    return <ol className="list-decimal pl-5 my-2 space-y-1 text-white/80">{children}</ol>
  },
  h1({ children }) {
    return <h1 className="text-lg font-bold text-white/90 my-3">{children}</h1>
  },
  h2({ children }) {
    return <h2 className="text-base font-bold text-white/85 my-2">{children}</h2>
  },
  h3({ children }) {
    return <h3 className="text-sm font-semibold text-white/80 my-2">{children}</h3>
  },
  hr() {
    return <hr className="my-4 border-white/10" />
  },
}

function modelDisplayName(m: string | undefined): string | null {
  if (!m) return null
  const nameMap: Record<string, string> = {
    "llama-3.3-70b-versatile": "Llama 3.3 70B",
    "llama3-70b-8192": "Llama 3 70B",
    "llama3-8b-8192": "Llama 3 8B",
    "mixtral-8x7b-32768": "Mixtral 8×7B",
    "gemma2-9b-it": "Gemma 2 9B",
    "gpt-4o": "GPT-4o",
    "gpt-4o-mini": "GPT-4o Mini",
    "gpt-4-turbo": "GPT-4 Turbo",
    "claude-3-opus-20240229": "Claude 3 Opus",
    "claude-3-sonnet-20240229": "Claude 3 Sonnet",
    "claude-3-haiku-20240307": "Claude 3 Haiku",
    "claude-3-5-sonnet-20241022": "Claude 3.5 Sonnet",
    "gemini-1.5-pro": "Gemini 1.5 Pro",
    "gemini-1.5-flash": "Gemini 1.5 Flash",
    "gemini-2.0-flash": "Gemini 2.0 Flash",
  }
  return nameMap[m] || m.split("/").pop() || m
}

function ChatMessage({ role, content, createdAt, messageId, metadata, onEdit, onRegenerate, onFeedback, skipAvatar, onSpeak, isSpeaking }: {
  role: string; content: string; createdAt?: string; messageId?: string; metadata?: Record<string, unknown>;
  onEdit?: (id: string, newContent: string) => void;
  onRegenerate?: () => void;
  onFeedback?: (id: string, feedback: "up" | "down") => void;
  skipAvatar?: boolean;
  onSpeak?: (messageId: string, text: string) => void;
  isSpeaking?: boolean;
}) {
  const isUser = role === "user"
  const [copied, setCopied] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(content)
  const [feedbackGiven, setFeedbackGiven] = useState<"up" | "down" | null>(null)
  const editRef = useRef<HTMLTextAreaElement>(null)

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [content])

  const handleSaveEdit = () => {
    if (editText.trim() && editText !== content && messageId && onEdit) {
      onEdit(messageId, editText.trim())
    }
    setEditing(false)
  }

  useEffect(() => {
    if (editing && editRef.current) {
      editRef.current.focus()
      editRef.current.setSelectionRange(editRef.current.value.length, editRef.current.value.length)
    }
  }, [editing])

  const timeStr = createdAt
    ? new Date(createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : ""
  const modelName = !isUser ? modelDisplayName(metadata?.model as string | undefined) : null

  // Edit mode
  if (editing) {
    return (
      <div className="flex gap-3 flex-row-reverse">
        {!skipAvatar && (
          <div className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center text-xs font-bold text-brand flex-shrink-0">
            U
          </div>
        )}
        <div className={`${skipAvatar ? "max-w-[88%]" : "max-w-[80%]"} rounded-2xl px-4 py-2.5 bg-brand/20`}>
          <textarea
            ref={editRef}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); handleSaveEdit() }
              if (e.key === "Escape") { setEditing(false); setEditText(content) }
            }}
            className="w-full bg-transparent text-sm text-white outline-none resize-none min-h-[40px]"
          />
          <div className="flex items-center justify-end gap-2 mt-2">
            <button
              onClick={() => { setEditing(false); setEditText(content) }}
              className="px-2 py-1 rounded text-xs text-text-tertiary hover:text-text-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              className="px-3 py-1 rounded text-xs font-medium bg-brand/30 hover:bg-brand/40 text-brand transition-colors"
            >
              Save & Send
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex gap-3 group ${isUser ? "flex-row-reverse" : ""}`}>
      {!skipAvatar && (
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
          isUser ? "bg-brand/20 text-brand" : "bg-accent/20 text-accent"
        }`}>
          {isUser ? "U" : "J"}
        </div>
      )}
      <div className={`${skipAvatar ? "max-w-[88%]" : "max-w-[80%]"} rounded-2xl px-4 py-2.5 transition-all ${
        isUser ? "bg-brand/20 text-white" : "glass text-white/90"
      } ${isSpeaking ? "ring-1 ring-brand/50 shadow-lg shadow-brand/10" : ""}`}>
        {role === "assistant" ? (
          <div className="text-sm leading-relaxed prose prose-invert max-w-none prose-p:my-1 prose-strong:text-white/80">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{content}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{content}</p>
        )}
        <div className="flex items-center gap-1 mt-1">
          <span className="text-[10px] text-white/30">{timeStr}</span>
          {modelName && (
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-text-tertiary">{modelName}</span>
          )}
          <div className="ml-auto flex items-center gap-0.5">
            {isUser && messageId && onEdit && (
              <button
                onClick={() => setEditing(true)}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 text-white/30 hover:text-white/60 transition-all"
                title="Edit"
              >
                <Pencil size={11} />
              </button>
            )}
            {!isUser && onRegenerate && (
              <button
                onClick={onRegenerate}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 text-white/30 hover:text-white/60 transition-all"
                title="Regenerate"
              >
                <RefreshCw size={11} />
              </button>
            )}
            {!isUser && onSpeak && messageId && (
              <button
                onClick={() => onSpeak(messageId, content)}
                className={`opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 transition-all ${
                  isSpeaking ? "text-brand" : "text-white/30 hover:text-white/60"
                }`}
                title={isSpeaking ? "Stop" : "Read aloud"}
              >
                <Volume2 size={11} />
              </button>
            )}
            {!isUser && messageId && onFeedback && (
              <>
                <button
                  onClick={() => { setFeedbackGiven("up"); onFeedback(messageId, "up") }}
                  className={`opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 transition-all ${
                    feedbackGiven === "up" ? "text-green-400" : "text-white/30 hover:text-white/60"
                  }`}
                >
                  <ThumbsUp size={11} />
                </button>
                <button
                  onClick={() => { setFeedbackGiven("down"); onFeedback(messageId, "down") }}
                  className={`opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 transition-all ${
                    feedbackGiven === "down" ? "text-red-400" : "text-white/30 hover:text-white/60"
                  }`}
                >
                  <ThumbsDown size={11} />
                </button>
              </>
            )}
            <button
              onClick={handleCopy}
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 text-white/30 hover:text-white/60 transition-all"
            >
              {copied ? <CheckCheck size={11} /> : <Copy size={11} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function SessionList({ onClose }: { onClose?: () => void }) {
  const { sessions, currentSessionId, selectSession, createSession, deleteSession, sessionsLoading } = useJarvisStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")

  const handleEdit = (id: string, name: string) => {
    setEditingId(id)
    setEditName(name)
  }

  const handleSaveEdit = async (id: string) => {
    await useJarvisStore.getState().updateSession(id, { name: editName } as any)
    setEditingId(null)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-white/10 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-text-primary">Chats</h2>
        <button
          onClick={async () => { await createSession(); onClose?.() }}
          className="p-1.5 rounded-lg hover:bg-white/10 text-text-secondary hover:text-white/90 transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {sessionsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={20} className="animate-spin text-text-tertiary" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8 text-text-tertiary text-xs">No conversations yet</div>
        ) : (
          sessions.map((s) => (
            <div
              key={s.id}
              className={`group flex items-center gap-2 px-3 py-2.5 cursor-pointer transition-colors ${
                currentSessionId === s.id ? "bg-brand/10 border-l-2 border-brand" : "hover:bg-white/5 border-l-2 border-transparent"
              }`}
              onClick={() => { selectSession(s.id); onClose?.() }}
            >
              <MessageSquare size={14} className="text-text-tertiary flex-shrink-0" />
              {editingId === s.id ? (
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={() => handleSaveEdit(s.id)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveEdit(s.id)}
                  className="flex-1 bg-white/10 rounded px-1.5 py-0.5 text-xs text-white outline-none border border-brand/50"
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="flex-1 text-xs text-text-secondary truncate">{s.name}</span>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); handleEdit(s.id, s.name) }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 text-text-tertiary hover:text-text-secondary"
              >
                <Pencil size={12} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); deleteSession(s.id) }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-text-tertiary hover:text-red-400"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function MemoryPanel({ onClose }: { onClose?: () => void }) {
  const { memories, memoriesLoading, addMemory, deleteMemory, togglePinMemory, loadMemories } = useJarvisStore()
  const [newMemory, setNewMemory] = useState("")
  const [category, setCategory] = useState("fact")

  useEffect(() => { loadMemories() }, [loadMemories])

  const handleAdd = async () => {
    if (!newMemory.trim()) return
    await addMemory(newMemory.trim(), category)
    setNewMemory("")
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-white/10 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-text-primary">Memories</h2>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-text-tertiary">
          <X size={16} />
        </button>
      </div>
      <div className="p-3 border-b border-white/10">
        <div className="flex gap-2">
          <input
            value={newMemory}
            onChange={(e) => setNewMemory(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Add a memory..."
            className="flex-1 bg-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none placeholder:text-text-tertiary"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-white/10 rounded-lg px-2 py-1.5 text-xs text-white outline-none"
          >
            <option value="fact">Fact</option>
            <option value="preference">Preference</option>
            <option value="event">Event</option>
            <option value="note">Note</option>
          </select>
          <button
            onClick={handleAdd}
            className="p-1.5 rounded-lg bg-brand/20 hover:bg-brand/30 text-brand transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {memoriesLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={20} className="animate-spin text-text-tertiary" />
          </div>
        ) : memories.length === 0 ? (
          <div className="text-center py-8 text-text-tertiary text-xs">No memories yet</div>
        ) : (
          memories.map((m) => (
            <div key={m.id} className="group flex items-start gap-2 px-3 py-2.5 hover:bg-white/5 transition-colors">
              <button
                onClick={() => togglePinMemory(m.id, !m.is_pinned)}
                className={`p-1 rounded flex-shrink-0 mt-0.5 ${m.is_pinned ? "text-yellow-400" : "text-text-muted hover:text-text-tertiary"}`}
              >
                <Star size={12} />
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-text-secondary leading-relaxed">{m.text}</p>
                <span className="text-xs text-text-tertiary mt-0.5 block">
                  {m.category} &middot; {new Date(m.created_at).toLocaleDateString()}
                </span>
              </div>
              <button
                onClick={() => deleteMemory(m.id)}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-text-tertiary hover:text-red-400 flex-shrink-0"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

import { SettingsPanel } from "@/components/settings/SettingsPanel"

const CAPABILITIES = [
  { icon: "🎯", label: "Goals", desc: "Create, track, and manage goals" },
  { icon: "💪", label: "Habits", desc: "Build and maintain habits" },
  { icon: "📝", label: "Journal", desc: "Reflect and analyze your days" },
  { icon: "💧", label: "Health", desc: "Track water, sleep, and fitness" },
  { icon: "🧠", label: "Memory", desc: "I remember what matters to you" },
  { icon: "📊", label: "Analyze", desc: "Spot patterns in your life data" },
]

const SUGGESTED_PROMPTS = [
  "Analyze my week so far",
  "What should I focus on today?",
  "Create a workout plan",
  "Help me plan a project",
  "What can you do?",
  "Summarize my habits this month",
]

function getDateLabel(dateStr: string): string {
  const d = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return "Today"
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday"
  return d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })
}

function groupMessages(msgs: Array<{ role: string; content: string; created_at?: string; id: string; metadata?: Record<string, unknown> }>) {
  const grouped: Array<{ type: "date" | "message"; label?: string; role?: string; content?: string; createdAt?: string; id?: string; metadata?: Record<string, unknown>; skipAvatar?: boolean }> = []
  let lastDate = ""
  let lastRole = ""

  for (let i = 0; i < msgs.length; i++) {
    const m = msgs[i]
    const msgDate = m.created_at ? new Date(m.created_at).toDateString() : ""

    // Date separator
    if (msgDate && msgDate !== lastDate) {
      grouped.push({ type: "date", label: getDateLabel(m.created_at!) })
      lastDate = msgDate
    }

    const isFirstInGroup = m.role !== lastRole
    const isLastInGroup = i === msgs.length - 1 || msgs[i + 1]?.role !== m.role

    grouped.push({
      type: "message",
      id: m.id,
      role: m.role,
      content: m.content,
      createdAt: m.created_at,
      metadata: m.metadata,
      skipAvatar: !isFirstInGroup,
    })
    lastRole = m.role
  }
  return grouped
}

export default function JarvisChat() {
  const {
    isAuthenticated, authLoading, user,
    messages, currentSessionId, chatLoading, streamingText, error,
    createSession, sendMessage, cancelStream, login, signup, logout,
    regenerate, editMessage,
  } = useJarvisStore()

  const [input, setInput] = useState("")
  const [showSidebar, setShowSidebar] = useState(true)
  const [activePanel, setActivePanel] = useState<"sessions" | "memories" | "settings" | null>("sessions")
  const [loginUsername, setLoginUsername] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [isSignup, setIsSignup] = useState(false)
  const [loginError, setLoginError] = useState("")
  const [loginLoading, setLoginLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const isNearBottomRef = useRef(true)
  const { speaking, paused, speakingMessageId, autoRead, setAutoRead, speakMessage, stopVoice, pauseVoice, resumeVoice } = useJarvisVoice()
  const lastMsgIdRef = useRef<string | null>(null)
  const autoSendTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Smart auto-scroll
  useEffect(() => {
    if (isNearBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, streamingText])

  // Auto-read new assistant messages
  useEffect(() => {
    if (!autoRead || messages.length === 0) return
    const last = messages[messages.length - 1]
    if (last.role === "assistant" && last.id !== lastMsgIdRef.current && !chatLoading) {
      lastMsgIdRef.current = last.id
      speakMessage(last.id, last.content)
    }
  }, [messages, autoRead, chatLoading, speakMessage])

  const handleScroll = useCallback(() => {
    const el = messagesContainerRef.current
    if (!el) return
    const threshold = 200
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < threshold
    isNearBottomRef.current = nearBottom
    setShowScrollBtn(!nearBottom)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    setShowScrollBtn(false)
  }

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto"
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + "px"
    }
  }, [input])

  const handleSend = () => {
    if (!input.trim() || chatLoading) return
    const msg = input.trim()
    lastMsgIdRef.current = null // Allow auto-read of next response
    if (autoSendTimerRef.current) { clearTimeout(autoSendTimerRef.current); autoSendTimerRef.current = null }
    setInput("")
    sendMessage(msg)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleEdit = (messageId: string, newContent: string) => {
    editMessage(messageId, newContent)
  }

  const handleRegenerate = () => {
    regenerate()
  }

  const handleFeedback = (messageId: string, feedback: "up" | "down") => {
    // Store feedback locally; extend to API in future
    const key = `jarvis_feedback_${messageId}`
    try { localStorage.setItem(key, feedback) } catch {}
  }

  // Determine the last assistant message for regenerate
  const lastAssistantId = [...messages].reverse().find(m => m.role === "assistant")?.id

  // Auth loading
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={24} className="animate-spin text-text-tertiary" />
      </div>
    )
  }

  // Auth screen
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="w-full max-w-sm glass rounded-2xl p-6 space-y-4">
          <div className="flex flex-col items-center gap-2 mb-2">
            <div className="w-12 h-12 rounded-xl bg-brand/20 flex items-center justify-center">
              <Bot size={24} className="text-brand" />
            </div>
            <h1 className="text-lg font-bold text-gradient">J.A.R.V.I.S</h1>
            <p className="text-xs text-text-tertiary text-center">Your AI strategist, coach, and mentor</p>
          </div>

          {loginError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-xs text-red-400 text-center">
              {loginError}
            </div>
          )}

          <input
            value={loginUsername}
            onChange={(e) => setLoginUsername(e.target.value)}
            placeholder="Username"
            className="w-full bg-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none placeholder:text-text-tertiary"
            onKeyDown={async (e) => {
              if (e.key === "Enter") {
                setLoginLoading(true); setLoginError("")
                try { isSignup ? await signup(loginUsername, loginPassword) : await login(loginUsername, loginPassword, rememberMe) }
                catch (err: any) { setLoginError(err.message) }
                setLoginLoading(false)
              }
            }}
          />
          <input
            type="password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            placeholder="Password"
            className="w-full bg-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none placeholder:text-text-tertiary"
            onKeyDown={async (e) => {
              if (e.key === "Enter") {
                setLoginLoading(true); setLoginError("")
                try { isSignup ? await signup(loginUsername, loginPassword) : await login(loginUsername, loginPassword, rememberMe) }
                catch (err: any) { setLoginError(err.message) }
                setLoginLoading(false)
              }
            }}
          />

          <label className="flex items-center gap-2 text-xs text-text-tertiary cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-white/20 bg-white/10 accent-brand"
            />
            Remember me (stay logged in for 30 days)
          </label>

          <button
            disabled={loginLoading}
            onClick={async () => {
              setLoginLoading(true)
              setLoginError("")
              try {
                if (isSignup) {
                  await signup(loginUsername, loginPassword)
                } else {
                  await login(loginUsername, loginPassword, rememberMe)
                }
              } catch (err) {
                setLoginError((err as Error).message)
              }
              setLoginLoading(false)
            }}
            className="w-full py-2.5 rounded-lg bg-accent/20 hover:bg-accent/30 text-accent text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            {loginLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : isSignup ? (
              <><UserPlus size={16} /> Sign Up</>
            ) : (
              <><LogIn size={16} /> Sign In</>
            )}
          </button>

          <button
            onClick={() => setIsSignup(!isSignup)}
            className="w-full text-xs text-text-tertiary hover:text-text-secondary transition-colors"
          >
            {isSignup ? "Already have an account? Sign in" : "No account? Create one"}
          </button>
        </div>
      </div>
    )
  }

  // Main chat UI
  return (
    <div className="flex h-full">
      {/* Sidebar */}
      {showSidebar && (
        <div className="w-64 flex-shrink-0 border-r border-white/[0.06] glass-strong hidden md:flex flex-col">
          <div className="flex border-b border-white/10">
            {[
              { key: "sessions", icon: MessageSquare, label: "Chats" },
              { key: "memories", icon: Brain, label: "Memory" },
              { key: "settings", icon: Settings, label: "Settings" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActivePanel(tab.key as any)}
                className={`flex-1 py-2.5 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
                  activePanel === tab.key ? "text-brand border-b-2 border-brand" : "text-text-tertiary hover:text-text-secondary"
                }`}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-hidden">
            {activePanel === "sessions" && <SessionList />}
            {activePanel === "memories" && <MemoryPanel />}
            {activePanel === "settings" && <SettingsPanel />}
          </div>
          <div className="p-3 border-t border-white/10 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
              <span className="text-xs font-bold text-accent">{user?.username?.[0]?.toUpperCase() || "?"}</span>
            </div>
            <span className="text-xs text-text-tertiary flex-1 truncate">{user?.username || "User"}</span>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg hover:bg-white/10 text-text-tertiary hover:text-red-400 transition-colors"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.06] glass-sm">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-text-tertiary hover:text-text-secondary hidden md:block"
          >
            {showSidebar ? <PanelLeftClose size={16} /> : <PanelLeft size={16} />}
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {speaking ? (
              <div className="flex items-end gap-[2px] h-[18px] flex-shrink-0">
                <span className="w-[3px] rounded-full bg-brand animate-pulse" style={{ height: "10px", animationDelay: "0ms" }} />
                <span className="w-[3px] rounded-full bg-brand animate-pulse" style={{ height: "16px", animationDelay: "150ms" }} />
                <span className="w-[3px] rounded-full bg-brand animate-pulse" style={{ height: "12px", animationDelay: "300ms" }} />
                <span className="w-[3px] rounded-full bg-brand animate-pulse" style={{ height: "18px", animationDelay: "80ms" }} />
                <span className="w-[3px] rounded-full bg-brand animate-pulse" style={{ height: "14px", animationDelay: "220ms" }} />
              </div>
            ) : (
              <Bot size={18} className="text-brand flex-shrink-0" />
            )}
            <h1 className="text-sm font-bold text-gradient truncate">J.A.R.V.I.S</h1>
            {!currentSessionId && (
              <span className="text-xs text-text-tertiary">No conversation selected</span>
            )}
          </div>
          <button
            onClick={() => setAutoRead(!autoRead)}
            className={`p-1.5 rounded-lg transition-colors ${
              autoRead ? "text-brand hover:bg-brand/20" : "text-text-tertiary hover:text-text-secondary hover:bg-white/10"
            }`}
            title={autoRead ? "Auto-read ON" : "Auto-read OFF"}
          >
            <Volume2 size={14} />
          </button>
          <div className="flex items-center gap-1 md:hidden">
            {[
              { key: "sessions", icon: MessageSquare },
              { key: "memories", icon: Brain },
              { key: "settings", icon: Settings },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActivePanel(tab.key as any)}
                className={`p-1.5 rounded-lg transition-colors ${
                  activePanel === tab.key ? "bg-brand/20 text-brand" : "text-text-tertiary hover:bg-white/10"
                }`}
              >
                <tab.icon size={14} />
              </button>
            ))}
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-text-tertiary hover:bg-white/10 hover:text-red-400 transition-colors"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div ref={messagesContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 relative">
          <div className="space-y-4">
          {!currentSessionId ? (
            <div className="flex items-center justify-center h-full min-h-[400px]">
              <div className="text-center max-w-sm">
                <Bot size={48} className="text-accent/30 mx-auto mb-4" />
                <h2 className="text-lg font-semibold text-text-secondary mb-2">Welcome to J.A.R.V.I.S</h2>
                <p className="text-xs text-text-tertiary mb-6">
                  Your AI assistant with persistent memory and context-aware conversations.
                </p>
                <button
                  onClick={async () => await createSession()}
                  className="px-4 py-2.5 rounded-xl bg-accent/20 hover:bg-accent/30 text-accent text-sm font-medium transition-colors"
                >
                  Start a Conversation
                </button>
              </div>
            </div>
          ) : messages.length === 0 && !chatLoading ? (
            <div className="flex flex-col items-center h-full min-h-[400px] pt-8">
              <div className="text-center mb-6 max-w-md">
                <Bot size={36} className="text-brand/40 mx-auto mb-3" />
                <h2 className="text-base font-semibold text-text-secondary mb-1">How can I help?</h2>
                <p className="text-xs text-text-tertiary">I&apos;m your AI strategist with access to your LifeOS data</p>
              </div>
              {/* Capability grid */}
              <div className="grid grid-cols-3 gap-2 max-w-md mb-6">
                {CAPABILITIES.map(c => (
                  <div key={c.label} className="glass rounded-xl px-3 py-2.5 text-center">
                    <span className="text-lg block mb-0.5">{c.icon}</span>
                    <p className="text-[10px] font-medium text-text-secondary">{c.label}</p>
                    <p className="text-[9px] text-text-tertiary leading-tight mt-0.5">{c.desc}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap justify-center gap-2 max-w-md">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => { sendMessage(prompt) }}
                    className="px-3 py-2 rounded-xl glass text-xs text-text-secondary hover:text-text-primary hover:bg-white/10 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {groupMessages(messages).map((item) => {
                if (item.type === "date") {
                  return (
                    <div key={item.label} className="flex items-center gap-3 py-2">
                      <div className="flex-1 h-px bg-white/5" />
                      <span className="text-[10px] font-medium text-text-tertiary uppercase tracking-wider">{item.label}</span>
                      <div className="flex-1 h-px bg-white/5" />
                    </div>
                  )
                }
                  const isLastAssistant = item.id === lastAssistantId
                return (
                  <div key={item.id}>
                  <ChatMessage
                    role={item.role!}
                    content={item.content!}
                    createdAt={item.createdAt}
                    metadata={item.metadata}
                    messageId={item.id}
                    skipAvatar={item.skipAvatar}
                    onEdit={handleEdit}
                    onRegenerate={isLastAssistant && !item.skipAvatar ? handleRegenerate : undefined}
                    onFeedback={handleFeedback}
                    onSpeak={item.role === "assistant" ? (id, text) => {
                      if (speaking && speakingMessageId === id) {
                        stopVoice()
                      } else {
                        speakMessage(id, text)
                      }
                    } : undefined}
                    isSpeaking={speaking && speakingMessageId === item.id}
                  />
                  {isLastAssistant && !item.skipAvatar && !chatLoading && item.metadata?.finish_reason === "length" && (
                    <button
                      onClick={() => sendMessage("Continue from where you left off")}
                      className="ml-12 mt-1 px-3 py-1.5 rounded-lg text-[11px] font-medium text-text-tertiary hover:text-text-secondary hover:bg-white/10 transition-colors border border-white/[0.06]"
                    >
                      Continue generating
                    </button>
                  )}
                  </div>
                )
              })}
              {chatLoading && !streamingText && <TypingDots />}
            </>
          )}
          </div>
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2 text-xs text-red-400 mt-4">
              {error}
            </div>
          )}
          <div ref={messagesEndRef} />
          <ScrollToBottomBtn visible={showScrollBtn} onClick={scrollToBottom} />
        </div>

        {/* Input */}
        {currentSessionId && (
          <div className="p-3 border-t border-white/10">
            <div className="flex items-end gap-2 max-w-4xl mx-auto">
              <div className="flex-1 glass rounded-2xl px-4 py-2.5 flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Message J.A.R.V.I.S..."
                  rows={1}
                  className="flex-1 bg-transparent text-sm text-white outline-none resize-none placeholder:text-text-tertiary max-h-[120px]"
                />
                <JarvisVoiceInput
                  onTranscript={(text) => {
                    setInput(text)
                    inputRef.current?.focus()
                    if (autoSendTimerRef.current) clearTimeout(autoSendTimerRef.current)
                    const autoSend = localStorage.getItem("lifeos-jarvis-autosend") === "true"
                    if (autoSend && text.trim()) {
                      autoSendTimerRef.current = setTimeout(() => handleSend(), 1500)
                    }
                  }}
                  onInterim={(text) => setInput(text)}
                  disabled={chatLoading}
                />
                {chatLoading ? (
                  <button
                    onClick={cancelStream}
                    className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors flex-shrink-0"
                  >
                    <X size={16} />
                  </button>
                ) : (
                  <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="p-1.5 rounded-lg bg-brand/20 hover:bg-brand/30 text-brand disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                  >
                    <Send size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Voice playback bar */}
      <JarvisVoicePlaybackBar
        speaking={speaking}
        paused={paused}
        onPause={pauseVoice}
        onResume={resumeVoice}
        onStop={stopVoice}
      />

      {/* Mobile sidebar overlay */}
      {activePanel && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setActivePanel(null)} />
          <div className="relative w-72 max-w-[85vw] glass-strong flex flex-col">
            {activePanel === "sessions" && <SessionList onClose={() => setActivePanel(null)} />}
            {activePanel === "memories" && <MemoryPanel onClose={() => setActivePanel(null)} />}
            {activePanel === "settings" && <SettingsPanel onClose={() => setActivePanel(null)} />}
          </div>
        </div>
      )}
    </div>
  )
}
