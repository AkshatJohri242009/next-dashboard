"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Flag, Trash2, ChevronRight, CheckCircle2, Circle, Clock } from "lucide-react"
import { markModified } from "@/lib/store"

interface Mission {
  id: string
  title: string
  description: string
  milestones: { title: string; done: boolean }[]
  status: "active" | "completed" | "paused"
  deadline: string | null
  createdAt: number
}

const STORAGE_KEY = "lifeos_missions"

function load(): Mission[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") }
  catch { return [] }
}

export function MissionsModule() {
  const [missions, setMissions] = useState<Mission[]>([])
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [milestoneInput, setMilestoneInput] = useState("")
  const [milestones, setMilestones] = useState<string[]>([])
  const [deadline, setDeadline] = useState("")
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => { setMissions(load()) }, [])

  const save = (updated: Mission[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    markModified(STORAGE_KEY)
    setMissions(updated)
  }

  const addMission = () => {
    if (!title.trim()) return
    const mission: Mission = {
      id: `mis_${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      milestones: milestones.map(m => ({ title: m, done: false })),
      status: "active",
      deadline: deadline || null,
      createdAt: Date.now(),
    }
    save([mission, ...missions])
    setTitle(""); setDescription(""); setMilestones([]); setDeadline(""); setShowForm(false)
  }

  const toggleMilestone = (mId: string, idx: number) => {
    save(missions.map(m => m.id === mId ? { ...m, milestones: m.milestones.map((ms, i) => i === idx ? { ...ms, done: !ms.done } : ms) } : m))
  }

  const setStatus = (id: string, status: Mission["status"]) => {
    save(missions.map(m => m.id === id ? { ...m, status } : m))
  }

  const deleteMission = (id: string) => save(missions.filter(m => m.id !== id))

  const statusColor = (s: Mission["status"]) => {
    if (s === "active") return "var(--success)"
    if (s === "completed") return "var(--brand)"
    return "var(--warning)"
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <Flag className="w-4 h-4 text-brand" />
          <h3 className="section-heading">Missions</h3>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="h-8 px-3 rounded-lg bg-brand/20 hover:bg-brand/30 text-brand text-[11px] font-medium transition-colors"
        >
          + Mission
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="space-y-3 p-4 rounded-xl bg-white/5 border border-white/10">
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Mission name..." className="w-full h-8 px-3 rounded-lg bg-white/5 border border-white/10 text-xs text-white outline-none placeholder:text-text-tertiary" />
              <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What does this mission entail?" rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none placeholder:text-white/25 resize-none" />
              <div className="flex gap-2">
                <input value={milestoneInput} onChange={e => setMilestoneInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && milestoneInput.trim()) { setMilestones([...milestones, milestoneInput.trim()]); setMilestoneInput("") } }}
                  placeholder="Add milestone..." className="flex-1 h-8 px-3 rounded-lg bg-white/5 border border-white/10 text-xs text-white outline-none placeholder:text-text-tertiary" />
              </div>
              {milestones.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {milestones.map((m, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-full bg-white/5 text-xs text-text-tertiary flex items-center gap-1">
                      {m}
                      <button onClick={() => setMilestones(milestones.filter((_, j) => j !== i))} className="text-text-muted hover:text-text-tertiary">&times;</button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-2">
                <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)}
                  className="flex-1 h-8 px-3 rounded-lg bg-white/5 border border-white/10 text-xs text-white outline-none" />
                <button onClick={addMission} disabled={!title.trim()}
                  className="h-8 px-4 rounded-lg bg-brand/20 hover:bg-brand/30 text-brand text-xs font-medium disabled:opacity-30 transition-colors"
                >
                  Launch
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {missions.length === 0 && (
          <div className="text-center py-8">
            <Flag className="w-6 h-6 text-white/10 mx-auto mb-2" />
            <p className="text-xs text-text-tertiary">No missions yet. Define something meaningful.</p>
          </div>
        )}
        {missions.map(m => {
          const doneCount = m.milestones.filter(ms => ms.done).length
          const totalCount = m.milestones.length
          return (
            <motion.div key={m.id} layout className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-colors">
              <div className="flex items-start gap-3">
                <button onClick={() => setExpanded(expanded === m.id ? null : m.id)} className="mt-0.5 flex-shrink-0 h-8 w-8 flex items-center justify-center" aria-label="Toggle expand">
                  <ChevronRight className={`w-3.5 h-3.5 text-text-tertiary transition-transform ${expanded === m.id ? "rotate-90" : ""}`} />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-semibold text-text-primary">{m.title}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded capitalize"
                      style={{ backgroundColor: `${statusColor(m.status)}20`, color: statusColor(m.status) }}
                    >
                      {m.status}
                    </span>
                    {m.deadline && (
                      <span className="text-[11px] text-text-tertiary flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {new Date(m.deadline).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </span>
                    )}
                  </div>
                  {m.description && <p className="text-[11px] text-text-tertiary mb-1.5 line-clamp-2">{m.description}</p>}
                  {totalCount > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${Math.round((doneCount / totalCount) * 100)}%` }} />
                      </div>
                      <span className="text-xs text-text-tertiary">{doneCount}/{totalCount}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {["active", "paused", "completed"].map(s => (
                    <button key={s} onClick={() => setStatus(m.id, s as Mission["status"])}
                      className="h-8 w-8 rounded flex items-center justify-center text-[11px] transition-opacity"
                      style={{
                        backgroundColor: m.status === s ? `${statusColor(s as Mission["status"])}20` : "transparent",
                        color: statusColor(s as Mission["status"]),
                        opacity: m.status === s ? 1 : 0.4,
                      }}
                      aria-label={`Set ${s}`}
                    >
                      {s === "active" ? "▶" : s === "paused" ? "⏸" : "✓"}
                    </button>
                  ))}
                  <button onClick={() => deleteMission(m.id)}
                    className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 h-8 w-8 rounded flex items-center justify-center hover:bg-red-500/20 text-text-tertiary hover:text-red-400 transition-all"
                    aria-label="Delete mission"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {expanded === m.id && m.milestones.length > 0 && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="mt-3 ml-7 space-y-1 border-l border-white/10 pl-3">
                      {m.milestones.map((ms, i) => (
                        <button key={i} onClick={() => toggleMilestone(m.id, i)}
                          className="flex items-center gap-2 py-1.5 w-full text-left group/milestone"
                        >
                          {ms.done
                            ? <CheckCircle2 className="w-3.5 h-3.5 text-brand flex-shrink-0" />
                            : <Circle className="w-3.5 h-3.5 text-text-muted group-hover/milestone:text-text-tertiary flex-shrink-0 transition-colors" />
                          }
                          <span className={`text-[11px] ${ms.done ? "line-through text-text-tertiary" : "text-text-tertiary"}`}>{ms.title}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
