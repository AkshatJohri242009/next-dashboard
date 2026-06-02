"use client"

import { useState, useEffect } from "react"
import { Target, X, Play, Pause, RotateCcw } from "lucide-react"
import { useStore } from "@/lib/store"

type Mission = {
  title: string
  status: string
  milestones?: { title: string; done: boolean }[]
}

export function FocusMode() {
  const open = useStore(s => s.focusOpen)
  const setOpen = useStore(s => s.setFocusOpen)
  const [timer, setTimer] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const [missions, setMissions] = useState<Mission[]>([])

  useEffect(() => {
    if (!open) return
    try {
      const ms: Mission[] = JSON.parse(localStorage.getItem("lifeos_missions") || "[]")
      setMissions(ms.filter(x => x.status === "active").slice(0, 6))
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

  const close = () => {
    setRunning(false)
    setTimer(25 * 60)
    setOpen(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] bg-[#050506] flex flex-col">
      <div className="flex items-center justify-between px-6 h-14 border-b border-white/[0.06] shrink-0">
        <div className="flex items-center gap-2.5">
          <Target className="w-4 h-4 text-brand" />
          <span className="text-sm font-bold text-white/70">Focus Mode</span>
        </div>
        <button onClick={close}
          className="h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4 text-white/70" />
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto">
        <div className="flex-1 flex flex-col items-center justify-center p-8 lg:border-r border-white/[0.06]">
          <div className="text-8xl font-bold tracking-tighter text-white tabular-nums mb-6">
            {formatTime(timer)}
          </div>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <button onClick={() => setRunning(!running)}
              className="h-12 w-12 rounded-full bg-brand text-black flex items-center justify-center hover:bg-brand/90 transition-colors"
            >
              {running ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
            <button onClick={() => { setTimer(25 * 60); setRunning(false) }}
              className="h-9 px-4 rounded-xl bg-white/5 border border-white/10 text-xs text-white/50 hover:text-white/70 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
            <div className="flex gap-1.5 ml-2">
              {[5, 15, 25, 30, 60].map(m => (
                <button key={m} onClick={() => { setTimer(m * 60); setRunning(false) }}
                  className={`h-9 px-3.5 rounded-xl text-xs font-medium transition-colors ${timer === m * 60 ? "bg-white/10 text-white" : "bg-white/5 text-white/40 hover:text-white/60"}`}
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full lg:w-96 xl:w-[28rem] p-6 lg:p-8 overflow-y-auto">
          <h3 className="text-xs text-white/40 font-medium uppercase tracking-wider mb-4">
            Active Missions <span className="text-white/20">({missions.length})</span>
          </h3>
          {missions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Target className="w-8 h-8 text-white/10 mb-3" />
              <p className="text-sm text-white/20">No active missions</p>
              <p className="text-xs text-white/10 mt-1">Create missions in Life OS to track them here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {missions.map((m, idx) => (
                <div key={idx} className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-2 h-2 rounded-full bg-brand/60" />
                    <span className="text-sm font-medium text-white/80">{m.title}</span>
                  </div>
                  {m.milestones && m.milestones.length > 0 && (
                    <div className="space-y-1.5 ml-4">
                      {m.milestones.map((ms, mi) => (
                        <div key={mi} className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${ms.done ? "bg-brand" : "bg-white/15"}`} />
                          <span className={`text-xs ${ms.done ? "line-through text-white/25" : "text-white/45"}`}>
                            {ms.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-2.5 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                    <div className="h-full rounded-full bg-brand/40 transition-all"
                      style={{ width: `${m.milestones ? Math.round(m.milestones.filter(m => m.done).length / Math.max(m.milestones.length, 1) * 100) : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
