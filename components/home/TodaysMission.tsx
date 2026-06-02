"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Target, Plus, Trash2, CheckCircle2, Circle } from "lucide-react"
import { useStore } from "@/lib/store"

export function TodaysMission() {
  const { goals, addGoal, toggleGoal, deleteGoal, loadGoals } = useStore()
  const [newText, setNewText] = useState("")
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
    addGoal(newText.trim())
    setNewText("")
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
          <h3 className="section-title text-sm">Today&apos;s Mission</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge-brand">{done}/{goals.length}</span>
          <button onClick={() => setShowInput(!showInput)}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-all"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showInput && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2 mb-3"
        >
          <input
            ref={inputRef}
            value={newText} onChange={e => setNewText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What do you want to accomplish?"
            className="flex-1 h-9 px-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white/70 outline-none focus:border-brand-500/40 placeholder:text-white/20"
          />
          <button onClick={handleAdd}
            className="h-9 px-4 rounded-xl bg-brand-500/20 border border-brand-500/30 text-xs font-medium text-brand-400 hover:bg-brand-500/30 transition-all"
          >
            Add
          </button>
        </motion.div>
      )}

      <div className="space-y-1 max-h-64 overflow-y-auto">
        {goals.length === 0 && !showInput && (
          <p className="text-sm text-white/30 text-center py-6">No goals yet. Tap + to add one.</p>
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
                : <Circle className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors" />
              }
            </button>
            <span className={`text-sm flex-1 min-w-0 truncate ${goal.done ? "line-through text-white/30" : "text-white/80"}`}>
              {goal.text}
            </span>
            {goal.pushedCount && goal.pushedCount > 0 && (
              <span className="text-[9px] text-white/20 shrink-0" title={`Carried over ${goal.pushedCount} day(s)`}>
                ↻{goal.pushedCount}
              </span>
            )}
            <button onClick={() => deleteGoal(idx)}
              className="shrink-0 h-7 w-7 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 text-white/20 hover:text-danger transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </div>

      {goals.filter(g => !g.done).length > 0 && goals.length > 5 && (
        <p className="text-[10px] text-white/20 text-center mt-2">
          {goals.filter(g => !g.done).length} pending · carried over from previous days
        </p>
      )}
    </div>
  )
}
