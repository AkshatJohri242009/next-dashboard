"use client"

import { useState, useRef, useEffect } from "react"
import { useJarvisStore } from "@/lib/jarvis-store"
import { Bot, Send, Plus, Trash2, Menu, X, MessageSquare, Lightbulb, Brain, Zap, Loader2, ChevronDown, PanelLeftClose, PanelLeft, Pencil, Check, Settings, Search, Archive, Star, LogOut, UserPlus, LogIn } from "lucide-react"

function ChatMessage({ role, content }: { role: string; content: string }) {
  const isUser = role === "user"
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
        isUser ? "bg-brand/20 text-brand" : "bg-accent/20 text-accent"
      }`}>
        {isUser ? "U" : "J"}
      </div>
      <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
        isUser ? "bg-brand/20 text-white" : "glass text-white/90"
      }`}>
        <p className="text-sm whitespace-pre-wrap leading-relaxed">{content}</p>
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
        <h2 className="text-sm font-semibold text-white/80">Chats</h2>
        <button
          onClick={async () => { await createSession(); onClose?.() }}
          className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white/90 transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {sessionsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={20} className="animate-spin text-white/40" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8 text-white/40 text-xs">No conversations yet</div>
        ) : (
          sessions.map((s) => (
            <div
              key={s.id}
              className={`group flex items-center gap-2 px-3 py-2.5 cursor-pointer transition-colors ${
                currentSessionId === s.id ? "bg-brand/10 border-l-2 border-brand" : "hover:bg-white/5 border-l-2 border-transparent"
              }`}
              onClick={() => { selectSession(s.id); onClose?.() }}
            >
              <MessageSquare size={14} className="text-white/40 flex-shrink-0" />
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
                <span className="flex-1 text-xs text-white/70 truncate">{s.name}</span>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); handleEdit(s.id, s.name) }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 text-white/40 hover:text-white/70"
              >
                <Pencil size={12} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); deleteSession(s.id) }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-white/40 hover:text-red-400"
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
        <h2 className="text-sm font-semibold text-white/80">Memories</h2>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-white/40">
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
            className="flex-1 bg-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none placeholder:text-white/30"
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
            <Loader2 size={20} className="animate-spin text-white/40" />
          </div>
        ) : memories.length === 0 ? (
          <div className="text-center py-8 text-white/40 text-xs">No memories yet</div>
        ) : (
          memories.map((m) => (
            <div key={m.id} className="group flex items-start gap-2 px-3 py-2.5 hover:bg-white/5 transition-colors">
              <button
                onClick={() => togglePinMemory(m.id, !m.is_pinned)}
                className={`p-1 rounded flex-shrink-0 mt-0.5 ${m.is_pinned ? "text-yellow-400" : "text-white/20 hover:text-white/40"}`}
              >
                <Star size={12} />
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/70 leading-relaxed">{m.text}</p>
                <span className="text-[10px] text-white/30 mt-0.5 block">
                  {m.category} &middot; {new Date(m.created_at).toLocaleDateString()}
                </span>
              </div>
              <button
                onClick={() => deleteMemory(m.id)}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-white/40 hover:text-red-400 flex-shrink-0"
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

export default function JarvisChat() {
  const {
    isAuthenticated, authLoading, user,
    messages, currentSessionId, chatLoading, streamingText, error,
    createSession, sendMessage, cancelStream, login, signup, logout,
  } = useJarvisStore()

  const [input, setInput] = useState("")
  const [showSidebar, setShowSidebar] = useState(true)
  const [activePanel, setActivePanel] = useState<"sessions" | "memories" | "settings" | null>("sessions")
  const [loginUsername, setLoginUsername] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [isSignup, setIsSignup] = useState(false)
  const [loginError, setLoginError] = useState("")
  const [loginLoading, setLoginLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    useJarvisStore.getState().checkAuth()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, streamingText])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto"
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + "px"
    }
  }, [input])

  const handleSend = () => {
    if (!input.trim() || chatLoading) return
    const msg = input.trim()
    setInput("")
    sendMessage(msg)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Auth loading
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={24} className="animate-spin text-white/40" />
      </div>
    )
  }

  // Auth screen
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="w-full max-w-sm glass rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3 justify-center mb-2">
            <Bot size={28} className="text-accent" />
            <h1 className="text-lg font-semibold text-white">J.A.R.V.I.S</h1>
          </div>
          <p className="text-xs text-white/50 text-center">Sign in to access your AI assistant</p>

          {loginError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-xs text-red-400 text-center">
              {loginError}
            </div>
          )}

          <input
            value={loginUsername}
            onChange={(e) => setLoginUsername(e.target.value)}
            placeholder="Username"
            className="w-full bg-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30"
            onKeyDown={async (e) => {
              if (e.key === "Enter") {
                setLoginLoading(true); setLoginError("")
                try { isSignup ? await signup(loginUsername, loginPassword) : await login(loginUsername, loginPassword) }
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
            className="w-full bg-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30"
            onKeyDown={async (e) => {
              if (e.key === "Enter") {
                setLoginLoading(true); setLoginError("")
                try { isSignup ? await signup(loginUsername, loginPassword) : await login(loginUsername, loginPassword) }
                catch (err: any) { setLoginError(err.message) }
                setLoginLoading(false)
              }
            }}
          />

          <button
            disabled={loginLoading}
            onClick={async () => {
              setLoginLoading(true)
              setLoginError("")
              try {
                if (isSignup) {
                  await signup(loginUsername, loginPassword)
                } else {
                  await login(loginUsername, loginPassword)
                }
              } catch (err: any) {
                setLoginError(err.message)
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
            className="w-full text-xs text-white/40 hover:text-white/60 transition-colors"
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
        <div className="w-64 flex-shrink-0 border-r border-white/10 bg-[#050506] hidden md:flex flex-col">
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
                  activePanel === tab.key ? "text-brand border-b-2 border-brand" : "text-white/40 hover:text-white/70"
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
              <span className="text-[10px] font-bold text-accent">{user?.username?.[0]?.toUpperCase() || "?"}</span>
            </div>
            <span className="text-xs text-white/50 flex-1 truncate">{user?.username || "User"}</span>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-red-400 transition-colors"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/10 bg-[#050506]/80 backdrop-blur-sm">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/70 hidden md:block"
          >
            {showSidebar ? <PanelLeftClose size={16} /> : <PanelLeft size={16} />}
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Bot size={18} className="text-accent flex-shrink-0" />
            <h1 className="text-sm font-semibold text-white/80 truncate">J.A.R.V.I.S</h1>
            {!currentSessionId && (
              <span className="text-[10px] text-white/30">No conversation selected</span>
            )}
          </div>
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
                  activePanel === tab.key ? "bg-brand/20 text-brand" : "text-white/40 hover:bg-white/10"
                }`}
              >
                <tab.icon size={14} />
              </button>
            ))}
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-white/40 hover:bg-white/10 hover:text-red-400 transition-colors"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!currentSessionId ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-sm">
                <Bot size={48} className="text-accent/30 mx-auto mb-4" />
                <h2 className="text-lg font-semibold text-white/60 mb-2">Welcome to J.A.R.V.I.S</h2>
                <p className="text-xs text-white/40 mb-6">
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
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageSquare size={32} className="text-white/20 mx-auto mb-3" />
                <p className="text-sm text-white/40">Send a message to start chatting</p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((m) => (
                <ChatMessage key={m.id} role={m.role} content={m.content} />
              ))}
              {streamingText && (
                <ChatMessage role="assistant" content={streamingText} />
              )}
              {chatLoading && !streamingText && (
                <div className="flex items-center gap-2 text-white/40 pl-2">
                  <Loader2 size={14} className="animate-spin" />
                  <span className="text-xs">Thinking...</span>
                </div>
              )}
            </>
          )}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2 text-xs text-red-400">
              {error}
            </div>
          )}
          <div ref={messagesEndRef} />
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
                  className="flex-1 bg-transparent text-sm text-white outline-none resize-none placeholder:text-white/30 max-h-[120px]"
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

      {/* Mobile sidebar overlay */}
      {activePanel && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setActivePanel(null)} />
          <div className="relative w-72 max-w-[85vw] bg-[#050506] border-r border-white/10 flex flex-col">
            {activePanel === "sessions" && <SessionList onClose={() => setActivePanel(null)} />}
            {activePanel === "memories" && <MemoryPanel onClose={() => setActivePanel(null)} />}
            {activePanel === "settings" && <SettingsPanel onClose={() => setActivePanel(null)} />}
          </div>
        </div>
      )}
    </div>
  )
}
