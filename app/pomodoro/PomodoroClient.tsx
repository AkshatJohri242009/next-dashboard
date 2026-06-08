"use client"

import { useState, useEffect } from "react"
import { Play, Pause, RotateCcw, Timer } from "lucide-react"
import { JarvisInsightBar } from "@/components/life/JarvisInsightBar"

export default function PomodoroPageClient() {
  const [timer, setTimer] = useState(25 * 60)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    if (!running) return
    const interval = setInterval(() => {
      setTimer(t => {
        if (t <= 1) { setRunning(false); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [running])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-xl bg-brand/20 flex items-center justify-center">
          <Timer className="w-4 h-4 text-brand" />
        </div>
        <div>
          <h1 className="page-title">Pomodoro</h1>
          <p className="text-sm text-text-tertiary">25/5/15 minute focus sessions</p>
        </div>
      </div>
      <JarvisInsightBar />
      <div className="min-h-[60vh] flex flex-col items-center justify-center rounded-2xl bg-white/[0.02] border border-white/[0.06]">
        <div className="text-8xl font-bold tracking-tighter text-white tabular-nums mb-6 select-none">
          {formatTime(timer)}
        </div>
        <div className="flex items-center gap-3 flex-wrap justify-center">
          <button onClick={() => setRunning(!running)}
            className="h-11 w-11 rounded-full bg-brand text-black flex items-center justify-center hover:bg-brand/90 transition-colors"
          >
            {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
          <button onClick={() => { setTimer(25 * 60); setRunning(false) }}
            className="h-9 px-4 rounded-xl bg-white/5 border border-white/10 text-xs text-white/50 hover:text-text-secondary transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
          <div className="flex gap-1 ml-2">
            {[5, 15, 25, 30, 60].map(m => (
              <button key={m} onClick={() => { setTimer(m * 60); setRunning(false) }}
                className={`h-9 px-3 rounded-xl text-xs font-medium transition-colors ${timer === m * 60 ? "bg-white/10 text-brand" : "bg-white/5 text-text-tertiary hover:text-text-secondary"}`}
              >
                {m}m
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
