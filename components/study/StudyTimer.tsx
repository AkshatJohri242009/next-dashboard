"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { Play, Pause, RotateCcw } from "lucide-react"

const FOCUS_MIN = 25
const BREAK_MIN = 5
const RING_RADIUS = 72
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

export function StudyTimer() {
  const [mode, setMode] = useState<"focus" | "break">("focus")
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_MIN * 60)
  const [running, setRunning] = useState(false)
  const [sessions, setSessions] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval>>()

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current)
            setRunning(false)
            if (mode === "focus") {
              setSessions(n => n + 1)
              setMode("break")
              setSecondsLeft(BREAK_MIN * 60)
            } else {
              setMode("focus")
              setSecondsLeft(FOCUS_MIN * 60)
            }
            return 0
          }
          return s - 1
        })
      }, 1000)
    }
    return () => clearInterval(intervalRef.current)
  }, [running, mode])

  function toggle() {
    if (running) {
      clearInterval(intervalRef.current)
      setRunning(false)
    } else {
      setRunning(true)
    }
  }

  function reset() {
    clearInterval(intervalRef.current)
    setRunning(false)
    setMode("focus")
    setSecondsLeft(FOCUS_MIN * 60)
  }

  const total = mode === "focus" ? FOCUS_MIN * 60 : BREAK_MIN * 60
  const progress = 1 - secondsLeft / total
  const mins = Math.floor(secondsLeft / 60)
  const secs = secondsLeft % 60

  return (
    <div className="glass rounded-2xl p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <span className="section-label">
          {mode === "focus" ? "Focus Timer" : "Break"}
        </span>
        <span className="text-[11px] font-mono text-white/30">
          {sessions} session{sessions !== 1 ? "s" : ""} done
        </span>
      </div>

      <div className="relative w-[160px] h-[160px] mx-auto">
        <svg viewBox="0 0 160 160" className="w-full h-full">
          <circle cx="80" cy="80" r={RING_RADIUS} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
          <motion.circle
            cx="80" cy="80" r={RING_RADIUS}
            fill="none"
            stroke={mode === "focus" ? "rgb(107,227,164)" : "rgb(251,191,36)"}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={RING_CIRCUMFERENCE}
            initial={false}
            animate={{ strokeDashoffset: RING_CIRCUMFERENCE * (1 - progress) }}
            transition={{ duration: 0.5, ease: "linear" }}
            style={{ transform: "rotate(-90deg)", transformOrigin: "80px 80px" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[40px] font-extrabold tabular-nums text-white/90 leading-none tracking-tight">
            {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
          </span>
          <span className="text-[11px] font-mono text-white/30 mt-1 uppercase">
            {mode === "focus" ? "Focus" : "Break"}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3">
        <button
          onClick={toggle}
          className="h-12 w-12 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center hover:bg-brand-500/30 transition-colors"
        >
          {running ? <Pause className="w-5 h-5 text-brand-300" /> : <Play className="w-5 h-5 text-brand-300" />}
        </button>
        <button
          onClick={reset}
          className="h-12 w-12 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center hover:bg-white/[0.08] transition-colors"
        >
          <RotateCcw className="w-4 h-4 text-white/40" />
        </button>
      </div>
    </div>
  )
}
