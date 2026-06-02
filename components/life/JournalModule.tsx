"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { PenSquare, TrendingUp, TrendingDown, Minus, Brain, Trash2, Sparkles } from "lucide-react"
import { markModified } from "@/lib/store"

interface JournalEntry {
  id: string
  date: string
  content: string
  mood: "great" | "good" | "okay" | "bad" | "awful"
  tags: string[]
  createdAt: number
}

const MOODS = [
  { value: "great", label: "Great", icon: Sparkles, color: "var(--success)" },
  { value: "good", label: "Good", icon: TrendingUp, color: "var(--brand)" },
  { value: "okay", label: "Okay", icon: Minus, color: "var(--warning)" },
  { value: "bad", label: "Bad", icon: TrendingDown, color: "var(--danger)" },
  { value: "awful", label: "Awful", icon: TrendingDown, color: "var(--danger)" },
]

const STORAGE_KEY = "lifeos_journal"

function loadEntries(): JournalEntry[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") }
  catch { return [] }
}

export function JournalModule() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [content, setContent] = useState("")
  const [mood, setMood] = useState<JournalEntry["mood"]>("okay")
  const [tagInput, setTagInput] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [showEditor, setShowEditor] = useState(false)
  const [insight, setInsight] = useState<string | null>(null)

  useEffect(() => {
    setEntries(loadEntries())
  }, [])

  const saveEntry = () => {
    if (!content.trim()) return
    const entry: JournalEntry = {
      id: `journal_${Date.now()}`,
      date: new Date().toISOString(),
      content: content.trim(),
      mood,
      tags,
      createdAt: Date.now(),
    }
    const updated = [entry, ...entries]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    markModified(STORAGE_KEY)
    setEntries(updated)
    setContent("")
    setTags([])
    setShowEditor(false)

    if (entries.length >= 3) {
      const goodMoods = updated.filter(e => e.mood === "great" || e.mood === "good")
      if (goodMoods.length > entries.length / 2) {
        setInsight("You've been recording mostly positive moods. Keep it up!")
      } else if (mood === "bad" || mood === "awful") {
        setInsight("Tough days happen. Consistent logging helps identify patterns.")
      }
    }
  }

  const deleteEntry = (id: string) => {
    const updated = entries.filter(e => e.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    markModified(STORAGE_KEY)
    setEntries(updated)
  }

  const today = new Date().toISOString().slice(0, 10)
  const todayEntry = entries.find(e => e.date.startsWith(today))
  const recentEntries = entries.slice(0, 10)

  const moodEmoji = (m: string) => {
    const map: Record<string, string> = { great: "🌟", good: "👍", okay: "😐", bad: "😞", awful: "💔" }
    return map[m] || "😐"
  }

  return (
    <div className="card-elevated p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <PenSquare className="w-4 h-4 text-accent" />
          <h3 className="section-title text-sm">Journal</h3>
        </div>
        {!todayEntry && (
          <button onClick={() => setShowEditor(!showEditor)}
            className="h-8 px-3 rounded-lg bg-accent/20 hover:bg-accent/30 text-accent text-[11px] font-medium transition-colors"
          >
            Write
          </button>
        )}
      </div>

      {insight && (
        <div className="insight-card mb-4 flex items-center gap-2.5">
          <Brain className="w-3.5 h-3.5 text-accent flex-shrink-0" />
          <p className="text-xs text-white/70">{insight}</p>
          <button onClick={() => setInsight(null)} className="h-8 w-8 rounded flex items-center justify-center hover:bg-white/10 ml-auto flex-shrink-0">
            <svg viewBox="0 0 24 24" className="w-3 h-3 text-white/30 fill-current"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
      )}

      <AnimatePresence>
        {showEditor && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-4">
            <div className="space-y-3 pt-1">
              <div className="flex flex-wrap gap-2">
                {MOODS.map(m => (
                  <button key={m.value} onClick={() => setMood(m.value as JournalEntry["mood"])}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${mood === m.value ? "text-white" : "text-white/40 hover:text-white/70"}`}
                    style={{
                      backgroundColor: mood === m.value ? `${m.color}25` : "rgba(255,255,255,0.05)",
                      outline: mood === m.value ? `2px solid ${m.color}` : "none",
                    }}
                  >
                    {moodEmoji(m.value)} {m.label}
                  </button>
                ))}
              </div>
              <textarea value={content} onChange={e => setContent(e.target.value)}
                placeholder="How was your day? What happened? What are you grateful for?"
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 resize-none"
              />
              <div className="flex flex-col sm:flex-row gap-2">
                <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && tagInput.trim()) { setTags([...tags, tagInput.trim()]); setTagInput("") } }}
                  placeholder="Add tag..."
                  className="flex-1 h-8 px-3 rounded-lg bg-white/5 border border-white/10 text-xs text-white outline-none placeholder:text-white/30"
                />
                <button onClick={saveEntry} disabled={!content.trim()}
                  className="h-8 px-4 rounded-lg bg-accent/20 hover:bg-accent/30 text-accent text-xs font-medium disabled:opacity-30 transition-colors"
                >
                  Save
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map(t => (
                    <span key={t} className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] text-white/50">
                      #{t}
                      <button onClick={() => setTags(tags.filter(x => x !== t))} className="ml-1 text-white/20 hover:text-white/50">&times;</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {todayEntry && (
        <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-sm">{moodEmoji(todayEntry.mood)}</span>
            <span className="text-xs text-white/40">{new Date(todayEntry.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            <div className="flex-1" />
            <span className="text-[10px] text-white/30">Today</span>
          </div>
          <p className="text-sm text-white/70 leading-relaxed">{todayEntry.content}</p>
          {todayEntry.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {todayEntry.tags.map(t => <span key={t} className="px-1.5 py-0.5 rounded bg-white/5 text-[10px] text-white/30">#{t}</span>)}
            </div>
          )}
        </div>
      )}

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {recentEntries.length === 0 && !showEditor && (
          <div className="text-center py-6">
            <PenSquare className="w-6 h-6 text-white/10 mx-auto mb-2" />
            <p className="text-xs text-white/30">No entries yet. Start journaling to see patterns.</p>
          </div>
        )}
        {recentEntries.filter(e => !e.date.startsWith(today)).map((entry) => (
          <div key={entry.id} className="group flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors">
            <span className="text-base mt-0.5">{moodEmoji(entry.mood)}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white/70 line-clamp-2 leading-relaxed">{entry.content}</p>
              <span className="text-[10px] text-white/30 mt-1 block">
                {new Date(entry.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              </span>
            </div>
            <button onClick={() => deleteEntry(entry.id)}
              className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 h-8 w-8 rounded flex items-center justify-center hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-all flex-shrink-0"
              aria-label="Delete entry"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
