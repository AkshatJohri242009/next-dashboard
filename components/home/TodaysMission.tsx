"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Target, Plus, Trash2, CheckCircle2, Circle, Clock, Calendar } from "lucide-react"
import { useStore } from "@/lib/store"

const priorityColors: Record<string, string> = {
  high: "var(--danger)",
  medium: "var(--warning)",
  low: "var(--info)",
}

const priorityLabels: Record<string, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
}

export function TodaysMission() {
  const { goals, addGoal, toggleGoal, deleteGoal, loadGoals } = useStore()
  const [newText, setNewText] = useState("")
  const [newPriority, setNewPriority] = useState<"low" | "medium" | "high" | undefined>(undefined)
  const [newDueDate, setNewDueDate] = useState("")
  const [newEstimatedMinutes, setNewEstimatedMinutes] = useState("")
  const [showInput, setShowInput] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadGoals()
  }, [loadGoals])

  useEffect(() => {
    if (showInput && inputRef.current) inputRef.current.focus()
  }, [showInput])

  const handleAdd = () => {
    if (!newText.trim()) return
    addGoal(newText.trim(), {
      priority: newPriority,
      dueDate: newDueDate || undefined,
      estimatedMinutes: newEstimatedMinutes ? Number(newEstimatedMinutes) : undefined,
    })
    setNewText("")
    setNewPriority(undefined)
    setNewDueDate("")
    setNewEstimatedMinutes("")
    setShowInput(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAdd()
    if (e.key === "Escape") { setShowInput(false); setNewText("") }
  }

  const done = goals.filter(g => g.done).length

  return (
    <div className="card-elevated p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <Target className="w-4 h-4 text-brand" />
          <h3 className="section-heading">Today&apos;s Mission</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge-brand">{done}/{goals.length}</span>
          <button onClick={() => setShowInput(!showInput)}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-text-tertiary hover:text-text-secondary hover:bg-white/[0.04] transition-all"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showInput && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2 mb-3"
        >
          <div className="flex gap-2">
            <input
              ref={inputRef}
              value={newText} onChange={e => setNewText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What do you want to accomplish?"
              className="flex-1 h-9 px-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-text-secondary outline-none focus:border-brand-500/40 placeholder:text-text-muted"
            />
            <button onClick={handleAdd}
              className="h-9 px-4 rounded-xl bg-brand-500/20 border border-brand-500/30 text-xs font-medium text-brand-400 hover:bg-brand-500/30 transition-all"
            >
              Add
            </button>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex gap-1">
              {(["high", "medium", "low"] as const).map(p => (
                <button key={p} onClick={() => setNewPriority(p === newPriority ? undefined : p)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-all ${
                    newPriority === p
                      ? "bg-white/10 border-white/20 text-text-primary"
                      : "border-white/[0.06] text-text-tertiary hover:text-text-secondary hover:bg-white/[0.03]"
                  }`}
                  style={{ borderColor: newPriority === p ? priorityColors[p] : undefined, color: newPriority === p ? priorityColors[p] : undefined }}
                >
                  {priorityLabels[p]}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-text-muted" />
              <input type="date" value={newDueDate} onChange={e => setNewDueDate(e.target.value)}
                className="h-7 px-2 rounded-md bg-white/[0.04] border border-white/[0.06] text-xs text-text-secondary outline-none w-[130px]"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-text-muted" />
              <input type="number" value={newEstimatedMinutes} onChange={e => setNewEstimatedMinutes(e.target.value)}
                placeholder="min" min="0"
                className="h-7 w-16 px-2 rounded-md bg-white/[0.04] border border-white/[0.06] text-xs text-text-secondary outline-none placeholder:text-text-muted"
              />
            </div>
          </div>
        </motion.div>
      )}

      <div className="space-y-1 max-h-64 overflow-y-auto">
        {goals.length === 0 && !showInput && (
          <div className="text-center py-6">
            <p className="text-sm text-text-tertiary mb-3">No goals yet. What do you want to accomplish?</p>
            <button onClick={() => setShowInput(true)}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-brand-500/20 border border-brand-500/30 text-xs font-medium text-brand-400 hover:bg-brand-500/30 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Goal
            </button>
          </div>
        )}
        {goals.map((goal, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03 }}
            className="group flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/[0.02] transition-colors"
          >
            <button onClick={() => toggleGoal(idx)} className="shrink-0">
              {goal.done
                ? <CheckCircle2 className="w-4 h-4 text-brand" />
                : <Circle className="w-4 h-4 text-text-muted group-hover:text-text-tertiary transition-colors" />
              }
            </button>
            <span className={`text-sm flex-1 min-w-0 truncate ${goal.done ? "line-through text-text-tertiary" : "text-text-primary"}`}>
              {goal.text}
            </span>
            {goal.priority && !goal.done && (
              <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded shrink-0"
                style={{ color: priorityColors[goal.priority], backgroundColor: `${priorityColors[goal.priority]}15` }}
              >
                {priorityLabels[goal.priority]}
              </span>
            )}
            {goal.dueDate && !goal.done && (
              <span className="flex items-center gap-1 text-[11px] text-text-tertiary shrink-0 whitespace-nowrap">
                <Calendar className="w-3 h-3" />
                {new Date(goal.dueDate + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            )}
            {goal.estimatedMinutes && !goal.done && (
              <span className="flex items-center gap-1 text-[11px] text-text-tertiary shrink-0 whitespace-nowrap">
                <Clock className="w-3 h-3" />
                {goal.estimatedMinutes}m
              </span>
            )}
            {goal.pushedCount && goal.pushedCount > 0 && (
              <span className="text-[11px] text-text-muted shrink-0" title={`Carried over ${goal.pushedCount} day(s)`}>
                ↻{goal.pushedCount}
              </span>
            )}
            <button onClick={() => deleteGoal(idx)}
              className="shrink-0 h-7 w-7 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 text-text-muted hover:text-danger transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </div>

      {goals.filter(g => !g.done).length > 0 && goals.length > 5 && (
        <p className="text-xs text-text-muted text-center mt-3">
          {goals.filter(g => !g.done).length} pending · carried over from previous days
        </p>
      )}
    </div>
  )
}