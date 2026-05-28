"use client"

import { useState } from "react"
import { motion, AnimatePresence, Reorder } from "framer-motion"
import { Plus, Sparkles, ArrowRight, GripVertical, Trash2, Zap, Timer } from "lucide-react"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"

export function TodoList() {
  const { goals, addGoal, toggleGoal, deleteGoal, editGoal, toggleQueued, reorderGoals, pushToTomorrow, addReminder, setNotificationPanel } = useStore()
  const [input, setInput] = useState("")
  const [editingIdx, setEditingIdx] = useState<number | null>(null)
  const [timerMin, setTimerMin] = useState<number>(0)
  const [remindIdx, setRemindIdx] = useState<number | null>(null)

  const done = goals.filter(g => g.done).length
  const total = goals.length
  const allDone = total > 0 && done === total

  const handleAdd = () => {
    const text = input.trim()
    if (!text) return
    addGoal(text, timerMin > 0 ? timerMin : undefined)
    setInput("")
    setTimerMin(0)
  }

  const glowClass = (pc: number) => {
    if (pc >= 3) return "shadow-[inset_0_0_0_1.5px_rgba(255,107,107,0.55),0_0_18px_rgba(255,107,107,0.22)]"
    if (pc === 2) return "shadow-[inset_0_0_0_1px_rgba(242,192,99,0.50),0_0_14px_rgba(242,192,99,0.18)]"
    if (pc === 1) return "shadow-[inset_0_0_0_1px_rgba(107,227,164,0.45),0_0_14px_rgba(107,227,164,0.15)]"
    return ""
  }

  return (
    <div className={cn("glass rounded-2xl p-5 relative overflow-hidden", allDone && "ring-1 ring-brand-400/20")}>
      {allDone && (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(107,227,164,0.10),transparent_60%)] pointer-events-none" />
      )}

      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[10px] font-mono font-extrabold tracking-widest text-white/30 uppercase">
            {allDone ? "All done — solid day" : "Today's goals"}
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <motion.span
              key={done}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              className="text-[42px] font-bold leading-none tracking-tight tabular-nums"
            >
              {done}
            </motion.span>
            <span className="text-lg font-mono text-white/30">/ {total}</span>
            <span className="text-[11px] font-mono text-white/30 ml-1 uppercase">
              {total === 0 ? "no goals yet" : allDone ? "complete" : "done"}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {goals.some(g => !g.done) && (
            <button
              onClick={() => {
                if (window.confirm("Move unchecked goals to tomorrow?")) pushToTomorrow()
              }}
              className="flex items-center gap-1.5 h-10 sm:h-8 px-4 sm:px-3 rounded-xl text-xs sm:text-[11px] font-bold font-mono text-white/40 bg-white/[0.04] border border-white/[0.06] hover:text-white/70 hover:bg-white/[0.08] transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
              Push
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1 h-1.5 mb-4">
        {goals.map((g, i) => (
          <div
            key={i}
            className={cn(
              "flex-1 rounded-full transition-colors duration-300",
              g.done ? "bg-brand-400 shadow-[0_0_6px_rgba(107,227,164,0.4)]" : "bg-white/[0.08]",
            )}
          />
        ))}
      </div>

      <Reorder.Group axis="y" values={goals} onReorder={reorderGoals} className="space-y-1.5">
        <AnimatePresence mode="popLayout">
          {goals.map((goal, idx) => (
            <Reorder.Item
              key={`${goal.text}-${idx}`}
              value={goal}
              as="div"
              className={cn(
                "flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-3 sm:py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] transition-colors group",
                goal.done && "opacity-40",
                glowClass(goal.pushedCount || 0),
              )}
              style={{ position: "relative" }}
            >
              <GripVertical className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-white/20 cursor-grab active:cursor-grabbing shrink-0" />

              <input
                type="checkbox"
                checked={goal.done}
                onChange={() => toggleGoal(idx)}
                className="w-5 h-5 sm:w-4.5 sm:h-4.5 rounded-lg appearance-none border-1.5 border-white/20 bg-black/20 checked:bg-brand-400 checked:border-brand-400 cursor-pointer shrink-0
                  checked:shadow-[0_0_12px_rgba(107,227,164,0.4)]
                  checked:after:content-[''] checked:after:block checked:after:w-1.5 checked:after:h-3 checked:after:border-r-2 checked:after:border-b-2 checked:after:border-black checked:after:rotate-45 checked:after:mx-auto checked:after:mt-[-1px]"
              />

              {editingIdx === idx ? (
                <input
                  autoFocus
                  defaultValue={goal.text}
                  onBlur={e => {
                    editGoal(idx, e.target.value)
                    setEditingIdx(null)
                  }}
                  onKeyDown={e => {
                    if (e.key === "Enter") { editGoal(idx, (e.target as HTMLInputElement).value); setEditingIdx(null) }
                    if (e.key === "Escape") setEditingIdx(null)
                  }}
                  className="flex-1 bg-transparent text-sm text-white outline-none border-b border-white/20"
                />
              ) : (
                <span
                  onClick={() => setEditingIdx(idx)}
                  className={cn("flex-1 text-sm cursor-pointer", goal.done && "line-through text-white/40")}
                >
                  {goal.text}
                </span>
              )}

              <button
                onClick={() => toggleQueued(idx)}
                className={cn(
                  "h-9 w-9 sm:h-7 sm:w-7 rounded-xl sm:rounded-lg flex items-center justify-center text-xs transition-colors",
                  goal.queued ? "text-amber-400 bg-amber-400/10" : "text-white/30 hover:text-white/60",
                )}
              >
                <Zap className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
              </button>

              <div className="relative">
                <button
                  onClick={() => setRemindIdx(remindIdx === idx ? null : idx)}
                  className={cn(
                    "h-9 w-9 sm:h-7 sm:w-7 rounded-xl sm:rounded-lg flex items-center justify-center text-xs transition-colors",
                    goal.reminderMin ? "text-brand-400 bg-brand-400/10" : "text-white/30 hover:text-brand-400/60",
                  )}
                >
                  <Timer className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                </button>
                {remindIdx === idx && (
                  <div className="absolute right-0 top-full mt-1 z-10 flex items-center gap-1 px-2 py-1.5 rounded-xl bg-surface-800 border border-white/[0.06] shadow-glass">
                    <input
                      type="number"
                      min={1}
                      max={1440}
                      defaultValue={goal.reminderMin || 30}
                      onChange={e => {
                        const m = Number(e.target.value)
                        if (m > 0) {
                          const updated = [...goals]
                          updated[idx] = { ...updated[idx], reminderMin: m }
                          localStorage.setItem("goals:" + new Date().toISOString().slice(0, 10), JSON.stringify(updated))
                        }
                      }}
                      className="w-14 h-7 px-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[10px] text-white outline-none text-center"
                    />
                    <span className="text-[9px] font-mono text-white/30">min</span>
                    <button
                      onClick={() => {
                        addReminder(goals[idx].text, "task", goals[idx].reminderMin || 30, idx)
                        setRemindIdx(null)
                      }}
                      className="h-7 px-2 rounded-lg bg-brand-500 text-[9px] font-bold text-black hover:bg-brand-400 transition-colors"
                    >
                      Go
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => deleteGoal(idx)}
                className="h-9 w-9 sm:h-7 sm:w-7 rounded-xl sm:rounded-lg flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-colors"
              >
                <Trash2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
              </button>
            </Reorder.Item>
          ))}
        </AnimatePresence>
      </Reorder.Group>

      {goals.length === 0 && (
        <div className="py-8 text-center text-sm text-white/30 italic">No goals for today — add one below.</div>
      )}

      <div className="flex gap-2 mt-4 pt-4 border-t border-white/[0.06]">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") handleAdd() }}
          placeholder="Add a goal for today..."
          className="flex-1 min-w-0 h-10 px-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-white outline-none placeholder:text-white/30 focus:border-white/20 transition-colors"
        />
        <input
          type="number"
          min={0}
          max={1440}
          value={timerMin}
          onChange={e => setTimerMin(Number(e.target.value))}
          placeholder="min"
          className="w-14 sm:w-16 h-10 px-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-xs text-white outline-none placeholder:text-white/30 text-center"
        />
        <button
          onClick={handleAdd}
          className="h-10 px-3 sm:px-4 rounded-xl bg-brand-500 text-black text-sm font-bold hover:bg-brand-400 transition-colors flex items-center gap-1.5 shadow-lg shadow-brand-500/20 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add</span>
        </button>
      </div>
    </div>
  )
}
