"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Timer, Play, Pause, RotateCcw, Clock } from "lucide-react"
import { JarvisInsightBar } from "@/components/life/JarvisInsightBar"
import { cn } from "@/lib/utils"

type TimerMode = "countdown" | "stopwatch"

const PRESETS = [1, 5, 15, 30, 60]

export default function TimerPage() {
  const [mode, setMode] = useState<TimerMode>("countdown")
  const [total, setTotal] = useState(5 * 60)
  const [remaining, setRemaining] = useState(5 * 60)
  const [running, setRunning] = useState(false)
  const [stopwatchMs, setStopwatchMs] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval>>()

  useEffect(() => {
    if (running && mode === "countdown") {
      intervalRef.current = setInterval(() => {
        setRemaining(s => {
          if (s <= 1) { setRunning(false); return 0 }
          return s - 1
        })
      }, 1000)
    }
    if (running && mode === "stopwatch") {
      const start = Date.now() - stopwatchMs
      intervalRef.current = setInterval(() => {
        setStopwatchMs(Date.now() - start)
      }, 100)
    }
    return () => clearInterval(intervalRef.current)
  }, [running, mode])

  const toggle = () => setRunning(!running)
  const reset = () => {
    setRunning(false)
    if (mode === "countdown") setRemaining(total)
    else setStopwatchMs(0)
  }

  const setPreset = (min: number) => {
    setRunning(false)
    setTotal(min * 60)
    setRemaining(min * 60)
  }

  const s = mode === "countdown" ? remaining : Math.floor(stopwatchMs / 1000)
  const mins = Math.floor(s / 60)
  const secs = s % 60
  const progress = mode === "countdown" ? 1 - remaining / total : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-400 to-accent-500 flex items-center justify-center">
          <Timer className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gradient">Timer</h1>
          <p className="text-sm text-white/40">Countdown & stopwatch</p>
        </div>
      </div>

      <JarvisInsightBar />

      <div className="max-w-md mx-auto">
        <div className="glass-strong rounded-2xl border border-white/[0.08] p-4 sm:p-6 text-center space-y-6">
          <div className="flex justify-center gap-2">
            {(["countdown", "stopwatch"] as const).map(m => (
              <button key={m} onClick={() => { setRunning(false); setMode(m); setStopwatchMs(0) }}
                className={cn("h-9 px-4 rounded-xl text-xs font-medium transition-all", mode === m ? "bg-white/10 text-white" : "bg-white/[0.04] text-white/40 hover:text-white/60")}
              >
                {m === "countdown" ? <Clock className="w-3.5 h-3.5 inline mr-1.5" /> : <Timer className="w-3.5 h-3.5 inline mr-1.5" />}
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>

          <div className="text-7xl font-bold tracking-tighter text-white tabular-nums">
            {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
            {mode === "stopwatch" && <span className="text-3xl text-white/30">.{Math.floor(stopwatchMs / 100) % 10}</span>}
          </div>

          {mode === "countdown" && (
            <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <motion.div className="h-full rounded-full bg-brand-400" animate={{ width: `${progress * 100}%` }} transition={{ duration: 0.5 }} />
            </div>
          )}

          <div className="flex justify-center gap-3">
            <button onClick={toggle}
              className="h-12 w-12 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center hover:bg-brand-500/30 transition-colors"
            >
              {running ? <Pause className="w-5 h-5 text-brand-300" /> : <Play className="w-5 h-5 text-brand-300" />}
            </button>
            <button onClick={reset}
              className="h-12 w-12 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center hover:bg-white/[0.08] transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-white/40" />
            </button>
          </div>

          {mode === "countdown" && (
            <div className="flex justify-center gap-2 flex-wrap">
              {PRESETS.map(m => (
                <button key={m} onClick={() => setPreset(m)}
                  className={cn("h-9 px-3 rounded-xl text-xs font-medium transition-all", total === m * 60 ? "bg-white/10 text-white" : "bg-white/[0.04] text-white/40 hover:text-white/60")}
                >
                  {m}m
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
