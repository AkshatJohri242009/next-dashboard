"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, X, Zap, Brain, Target, Lightbulb, Loader2, Bot } from "lucide-react"
import { useStore } from "@/lib/store"
import { ROUTES } from "@/lib/routes"
import { useMediaQuery } from "@/lib/use-media-query"
import { useState, useRef, useEffect } from "react"

type Message = { role: "user" | "assistant"; text: string }

export function AIPanel() {
  const { aiPanelOpen, setAIPanel } = useStore()
  const isMobile = useMediaQuery("(max-width: 1023px)")
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [jarvisMode, setJarvisMode] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput("")
    setMessages(prev => [...prev, { role: "user", text }])
    setLoading(true)
    try {
      let reply = ""
      if (jarvisMode) {
        window.location.href = ROUTES.ODYSSEY
        setLoading(false)
        return
      }
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      })
      const data = await res.json()
      reply = data.reply || data.error || "No response"
      setMessages(prev => [...prev, { role: "assistant", text: reply }])
    } catch {
      setMessages(prev => [...prev, { role: "assistant", text: "Network error — check your connection." }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {aiPanelOpen && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: isMobile ? "100%" : 340, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="fixed right-0 top-0 h-screen z-40 flex flex-col glass-strong border-l border-white/[0.06] overflow-hidden"
        >
          <div className="flex items-center justify-between h-14 px-4 border-b border-white/[0.06] shrink-0">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${jarvisMode ? "bg-[#e06c75]/20" : "bg-gradient-to-br from-brand-400 to-accent-500"}`}>
                {jarvisMode ? <Bot className="w-3.5 h-3.5 text-[#e06c75]" /> : <Sparkles className="w-3.5 h-3.5 text-white" />}
              </div>
              <span className="text-sm font-bold text-gradient">{jarvisMode ? "J.A.R.V.I.S" : "AI Assistant"}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setJarvisMode(!jarvisMode)}
                className={`h-7 px-2 rounded-lg text-[10px] font-mono font-bold border transition-colors ${
                  jarvisMode ? "bg-[#e06c75]/20 text-[#e06c75] border-[#e06c75]/30" : "bg-white/[0.04] text-white/30 border-white/[0.06] hover:text-white/50"
                }`}
              >
                {jarvisMode ? "JARVIS" : "Gemini"}
              </button>
              <button onClick={() => setAIPanel(false)} className="h-8 w-8 flex items-center justify-center text-white/30 hover:text-white/60 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center text-white/30 gap-3">
                <Bot className="w-10 h-10 text-brand-400/50" />
                <p className="text-sm">Ask me anything about your dashboard, health, or productivity.</p>
              </div>
            )}
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 p-3 rounded-xl ${
                  msg.role === "assistant"
                    ? "bg-white/[0.03] border border-white/[0.06]"
                    : "bg-brand-500/10 border border-brand-500/20"
                }`}
              >
                {msg.role === "assistant" ? (
                  <Brain className="w-4 h-4 text-brand-400 mt-0.5 shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded bg-accent-400/30 mt-0.5 shrink-0 flex items-center justify-center text-[8px] font-bold text-accent-300">
                    U
                  </div>
                )}
                <p className="text-xs text-white/60 leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              </motion.div>
            ))}
            {loading && (
              <div className="flex gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <Loader2 className="w-4 h-4 text-brand-400 mt-0.5 shrink-0 animate-spin" />
                <p className="text-xs text-white/40">Thinking...</p>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="p-3 border-t border-white/[0.06]">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") send() }}
                placeholder="Ask AI..."
                className="flex-1 h-9 px-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-xs text-white outline-none placeholder:text-white/30"
              />
              <button
                onClick={send}
                disabled={loading || !input.trim()}
                className="h-9 px-3 rounded-xl bg-brand-500 text-black text-xs font-bold hover:bg-brand-400 transition-colors disabled:opacity-40"
              >
                <Zap className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
