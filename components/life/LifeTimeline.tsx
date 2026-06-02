"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Clock, Plus, Trash2, Briefcase, GraduationCap, Heart, Home, Star, Zap } from "lucide-react"
import { markModified } from "@/lib/store"

interface TimelineEvent {
  id: string
  date: string
  title: string
  description: string
  category: "career" | "education" | "relationship" | "move" | "achievement" | "other"
  createdAt: number
}

const STORAGE_KEY = "lifeos_timeline"

const CATEGORIES = [
  { value: "career", label: "Career", icon: Briefcase, color: "var(--brand)" },
  { value: "education", label: "Education", icon: GraduationCap, color: "var(--accent)" },
  { value: "relationship", label: "Relationship", icon: Heart, color: "var(--danger)" },
  { value: "move", label: "Move", icon: Home, color: "var(--warning)" },
  { value: "achievement", label: "Achievement", icon: Star, color: "var(--success)" },
  { value: "other", label: "Other", icon: Zap, color: "var(--info)" },
]

function load(): TimelineEvent[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") }
  catch { return [] }
}

export function LifeTimeline() {
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState("")
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<TimelineEvent["category"]>("achievement")

  useEffect(() => { setEvents(load()) }, [])

  const save = (updated: TimelineEvent[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    markModified(STORAGE_KEY)
    setEvents(updated)
  }

  const addEvent = () => {
    if (!title.trim()) return
    const event: TimelineEvent = {
      id: `tl_${Date.now()}`,
      date,
      title: title.trim(),
      description: description.trim(),
      category,
      createdAt: Date.now(),
    }
    save([event, ...events])
    setTitle(""); setDescription(""); setShowForm(false)
  }

  const deleteEvent = (id: string) => save(events.filter(e => e.id !== id))

  const sorted = [...events].sort((a, b) => b.date.localeCompare(a.date))

  const catMeta = (v: string) => CATEGORIES.find(c => c.value === v) || CATEGORIES[5]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <Clock className="w-4 h-4 text-brand" />
          <h3 className="section-title text-sm">Life Timeline</h3>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="h-8 px-3 rounded-lg bg-brand/20 hover:bg-brand/30 text-brand text-[11px] font-medium transition-colors"
        >
          + Event
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="space-y-3 p-4 rounded-xl bg-white/5 border border-white/10">
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Event title..." className="w-full h-8 px-3 rounded-lg bg-white/5 border border-white/10 text-xs text-white outline-none placeholder:text-white/30" />
              <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What happened?" rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none placeholder:text-white/25 resize-none" />
              <div className="flex flex-col sm:flex-row gap-2">
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="h-8 px-3 rounded-lg bg-white/5 border border-white/10 text-xs text-white outline-none" />
                <select value={category} onChange={e => setCategory(e.target.value as TimelineEvent["category"])}
                  className="h-8 px-3 rounded-lg bg-white/5 border border-white/10 text-xs text-white/70 outline-none"
                >
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map(c => (
                  <button key={c.value} onClick={() => setCategory(c.value as TimelineEvent["category"])}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${
                      category === c.value ? "text-white" : "text-white/40 hover:text-white/60"
                    }`}
                    style={{
                      backgroundColor: category === c.value ? `${c.color}20` : "rgba(255,255,255,0.05)",
                      outline: category === c.value ? `1.5px solid ${c.color}` : "none",
                    }}
                  >
                    <c.icon className="w-3 h-3 inline mr-1" />{c.label}
                  </button>
                ))}
              </div>
              <button onClick={addEvent} disabled={!title.trim()}
                className="h-8 px-4 rounded-lg bg-brand/20 hover:bg-brand/30 text-brand text-xs font-medium disabled:opacity-30 transition-colors"
              >
                Add to Timeline
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {events.length > 0 && (
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <p className="text-[11px] text-white/50">{events.length} events</p>
          <div className="w-px h-3 bg-white/10" />
          <p className="text-[11px] text-white/50">
            <span className="text-white/70">{new Set(events.map(e => e.date.slice(0, 4))).size}</span> years covered
          </p>
          <div className="w-px h-3 bg-white/10" />
          <p className="text-[11px] text-white/50">
            Earliest: <span className="text-white/70">{sorted[sorted.length - 1]?.date || "—"}</span>
          </p>
        </div>
      )}

      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
        {sorted.length === 0 && (
          <div className="text-center py-8">
            <Clock className="w-6 h-6 text-white/10 mx-auto mb-2" />
            <p className="text-xs text-white/30">No events yet. Start building your life timeline.</p>
          </div>
        )}
        {sorted.map((event, idx) => {
          const meta = catMeta(event.category)
          const prevDate = idx < sorted.length - 1 ? sorted[idx + 1].date : null
          const showYear = !prevDate || prevDate.slice(0, 4) !== event.date.slice(0, 4)
          return (
            <div key={event.id}>
              {showYear && (
                <div className="flex items-center gap-3 mb-2 mt-3 first:mt-0">
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="text-[10px] font-bold text-white/30 tracking-wider">{event.date.slice(0, 4)}</span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>
              )}
              <motion.div layout className="group relative flex items-start gap-4 pl-4">
                <div className="absolute left-0 top-2 bottom-0 w-px bg-white/10 -z-0" />
                <div className="absolute left-[-3px] top-2 w-[7px] h-[7px] rounded-full z-10" style={{ backgroundColor: meta.color }} />
                <div className="flex-1 min-w-0 pb-3">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-white/80">{event.title}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ backgroundColor: `${meta.color}20`, color: meta.color }}>
                          {meta.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-white/40 mt-0.5">{event.date}</p>
                      {event.description && <p className="text-[11px] text-white/50 mt-1 line-clamp-2">{event.description}</p>}
                    </div>
                    <button onClick={() => deleteEvent(event.id)}
                      className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 h-8 w-8 rounded flex items-center justify-center hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-all flex-shrink-0"
                      aria-label="Delete event"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
