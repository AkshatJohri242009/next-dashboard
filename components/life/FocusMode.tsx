"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Target, Timer, ListTodo, Zap, X, Maximize2, Minimize2 } from "lucide-react"

export function FocusMode() {
  const [open, setOpen] = useState(false)
  const [timer, setTimer] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const [goals, setGoals] = useState<{ text: string; done: boolean }[]>([])

  useEffect(() => {
    try {
      const g = JSON.parse(localStorage.getItem("goals:" + new Date().toISOString().slice(0, 10)) || "[]")
      setGoals(g)
    } catch {}
  }, [open])

  useEffect(() => {
    if (!running || !open) return
    const interval = setInterval(() => {
      setTimer(t => {
        if (t <= 1) { setRunning(false); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [running, open])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`
  }

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="h-9 px-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2 text-xs text-white/50 hover:text-white/70 hover:bg-white/10 transition-all"
      >
        <Zap className="w-3.5 h-3.5" />
        Focus
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-center justify-center"
          >
            <div className="max-w-lg w-full mx-4">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2.5">
                  <Target className="w-5 h-5 text-brand" />
                  <span className="text-lg font-bold text-white/80">Focus Mode</span>
                </div>
                <button onClick={() => { setRunning(false); setTimer(25 * 60); setOpen(false) }}
                  className="h-9 w-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-white/50" />
                </button>
              </div>

              <div className="text-center mb-8">
                <div className="text-7xl font-bold tracking-tighter text-white tabular-nums mb-4">
                  {formatTime(timer)}
                </div>
                <div className="flex justify-center gap-3">
                  <button onClick={() => setRunning(!running)}
                    className="h-10 px-6 rounded-xl bg-brand text-black text-sm font-bold hover:bg-brand/90 transition-colors"
                  >
                    {running ? "Pause" : "Start"}
                  </button>
                  <button onClick={() => { setTimer(25 * 60); setRunning(false) }}
                    className="h-10 px-6 rounded-xl bg-white/5 border border-white/10 text-xs text-white/50 hover:text-white/70 transition-colors"
                  >
                    Reset
                  </button>
                  <div className="flex gap-1">
                    {[25, 5, 15].map(m => (
                      <button key={m} onClick={() => { setTimer(m * 60); setRunning(false) }}
                        className={`h-10 px-3 rounded-xl text-xs font-medium transition-colors ${timer === m * 60 ? "bg-white/10 text-white" : "bg-white/5 text-white/40 hover:text-white/60"}`}
                      >
                        {m}m
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs text-white/40 font-medium uppercase tracking-wider mb-3">Today&apos;s Tasks</h4>
                {goals.length === 0 && (
                  <p className="text-sm text-white/20 text-center py-4">No tasks. Add goals to focus on them.</p>
                )}
                {goals.map((g, idx) => (
                  <div key={idx} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5">
                    <div className={`w-1.5 h-1.5 rounded-full ${g.done ? "bg-brand" : "bg-white/20"}`} />
                    <span className={`text-sm ${g.done ? "line-through text-white/30" : "text-white/70"}`}>{g.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
