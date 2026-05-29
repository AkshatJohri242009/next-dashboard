"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Check, Plus, Trash2, Flame, Target, CheckCheck, Zap } from "lucide-react"
import { useStore } from "@/lib/store"

export function StudyTasks() {
  const { studyTasks, studyStreak, addStudyTask, toggleStudyTask, deleteStudyTask } = useStore()
  const [text, setText] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter" && text.trim()) {
        addStudyTask(text.trim())
        setText("")
      }
    }
    const el = inputRef.current
    if (el) el.addEventListener("keydown", handler)
    return () => { if (el) el.removeEventListener("keydown", handler) }
  }, [text, addStudyTask])

  const total = studyTasks.length
  const done = studyTasks.filter(t => t.done).length
  const donePct = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div className="glass rounded-2xl p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono font-extrabold tracking-widest text-white/30 uppercase">
          Study Tasks
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="glass rounded-xl p-3 text-center space-y-1">
          <Target className="w-4 h-4 text-brand-400 mx-auto" />
          <span className="block text-lg font-extrabold tabular-nums text-white/80">{total}</span>
          <span className="text-[10px] font-mono text-white/30">Total</span>
        </div>
        <div className="glass rounded-xl p-3 text-center space-y-1">
          <CheckCheck className="w-4 h-4 text-blue-400 mx-auto" />
          <span className="block text-lg font-extrabold tabular-nums text-white/80">{donePct}%</span>
          <span className="text-[10px] font-mono text-white/30">Done</span>
        </div>
        <div className="glass rounded-xl p-3 text-center space-y-1">
          <Flame className="w-4 h-4 text-amber-400 mx-auto" />
          <span className="block text-lg font-extrabold tabular-nums text-white/80">{studyStreak}</span>
          <span className="text-[10px] font-mono text-white/30">Streak</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Add a study task..."
          className="flex-1 h-11 px-4 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-white/80 placeholder:text-white/20 outline-none focus:border-brand-500/40 focus:bg-white/[0.06] transition-colors"
        />
        <button
          onClick={() => { if (text.trim()) { addStudyTask(text.trim()); setText("") } }}
          className="h-11 w-11 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center hover:bg-brand-500/30 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4 text-brand-300" />
        </button>
      </div>

      <div className="space-y-2 max-h-[320px] overflow-y-auto scrollbar-hide">
        {studyTasks.length === 0 && (
          <p className="text-sm text-white/20 text-center py-6">No tasks yet — add one above</p>
        )}
        {studyTasks.map((task) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors group"
          >
            <button
              onClick={() => toggleStudyTask(task.id)}
              className={`shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                task.done ? "bg-brand-500 border-brand-500" : "border-white/20 hover:border-brand-400"
              }`}
            >
              {task.done && <Check className="w-3 h-3 text-white" />}
            </button>
            <span className={`flex-1 text-sm ${task.done ? "line-through text-white/30" : "text-white/70"}`}>
              {task.text}
            </span>
            <button
              onClick={() => deleteStudyTask(task.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-white/20 hover:text-red-400"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
