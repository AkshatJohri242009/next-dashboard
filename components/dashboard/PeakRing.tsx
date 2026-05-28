"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Moon, Clock } from "lucide-react"
import { useStore } from "@/lib/store"
import { interpolateColor, computePeakWindow, waterGoalMl } from "@/lib/utils"

const RING_RADIUS = 52
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS
const WAKE_HOUR = 8

export function PeakRing() {
  const sleep = useStore(s => s.sleep)
  const health = useStore(s => s.health)
  const sleepTimerStart = useStore(s => s.sleepTimerStart)
  const startSleepTimer = useStore(s => s.startSleepTimer)
  const stopSleepTimer = useStore(s => s.stopSleepTimer)
  const [time, setTime] = useState<Date | null>(null)

  useEffect(() => {
    setTime(new Date())
    const timer = setInterval(() => setTime(new Date()), 60 * 1000)
    return () => clearInterval(timer)
  }, [])

  const hours = time ? time.getHours() + time.getMinutes() / 60 : 0
  const goalMl = waterGoalMl(health)
  const waterPct = goalMl > 0 ? Math.min(1, (health.waterMl || 0) / goalMl) : 0
  const peakPct = computePeakWindow(sleep, waterPct)
  const dayPct = hours >= WAKE_HOUR ? Math.max(0, Math.min(100, ((hours - WAKE_HOUR) / 16) * 100)) : 0
  const color = interpolateColor(peakPct)

  let phase = "SLEEPING"
  let status = "Still sleeping"
  if (hours >= WAKE_HOUR) {
    if (peakPct >= 75) { phase = "PEAK"; status = "Peak window — perform" }
    else if (peakPct >= 50) { phase = "FOCUS"; status = "Good energy — stay productive" }
    else if (peakPct >= 25) { phase = "MODERATE"; status = "Moderate energy — keep going" }
    else { phase = "LOW"; status = "Low energy — rest up" }
  }

  return (
    <div className="glass rounded-2xl p-5 flex items-center gap-6 flex-wrap">
      <div className="relative w-[140px] h-[140px] sm:w-[168px] sm:h-[168px] shrink-0">
        <svg viewBox="0 0 120 120" className="w-full h-full">
          <circle cx="60" cy="60" r={RING_RADIUS} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
          <motion.circle
            cx="60" cy="60" r={RING_RADIUS}
            fill="none" stroke={color} strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={RING_CIRCUMFERENCE}
            initial={false}
            animate={{ strokeDashoffset: RING_CIRCUMFERENCE * (1 - dayPct / 100) }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{ transform: "rotate(-90deg)", transformOrigin: "60px 60px" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <motion.span
            key={Math.round(peakPct)}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-[40px] font-extrabold leading-none tracking-tight tabular-nums"
            style={{ color }}
          >
            {!time || hours < WAKE_HOUR ? "--" : `${Math.round(peakPct)}%`}
          </motion.span>
          <span className="text-[9.5px] font-mono font-extrabold tracking-widest text-white/30 mt-1">{phase}</span>
          <span className="text-[10.5px] font-mono text-white/30 mt-1">
            {time ? time.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }) : ""}
          </span>
        </div>
      </div>

      <div className="flex-1 space-y-2 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-white/80">{status}</span>
          <span className="text-[11px] font-mono text-white/30 tabular-nums">
            PEAK WINDOW · {peakPct}%
          </span>
        </div>
        <div className="text-[12px] font-mono text-white/40">
          {!time ? ""
            : hours < WAKE_HOUR
            ? `${Math.ceil((WAKE_HOUR - hours) * 60)}m until wake-up`
            : `${Math.ceil((24 - hours) * 60)}m awake time left`}
        </div>

        <div className="flex items-center gap-2 pt-3 border-t border-white/[0.06]">
          <span className="text-[9.5px] font-mono font-extrabold tracking-widest text-white/30 shrink-0">SLEEP</span>
          <input
            type="range"
            min={0} max={16} step={0.5}
            value={sleep}
            onChange={e => useStore.getState().setSleep(parseFloat(e.target.value))}
            className="flex-1 min-w-0 h-1.5 rounded-full appearance-none bg-white/[0.08] accent-brand-400 cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5
              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-400
              [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(107,227,164,0.5)]"
          />
          <span className="text-[11px] font-mono font-bold text-white/60 tabular-nums shrink-0">{sleep}h</span>
          <span className={`text-[11px] font-mono font-bold tabular-nums shrink-0 ${
            sleep >= 8 ? "text-brand-400" : sleep >= 6 ? "text-amber-400" : "text-red-400"
          }`}>
            {sleep >= 8 ? "0h debt" : `+${(8 - sleep).toFixed(1)}h debt`}
          </span>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
          {sleepTimerStart ? (
            <>
              <Clock className="w-3.5 h-3.5 text-brand-400 shrink-0" />
              <span className="text-[11px] font-mono text-white/60 flex-1">
                Sleeping for {Math.floor((Date.now() - sleepTimerStart) / 60000)}m
              </span>
              <button
                onClick={stopSleepTimer}
                className="h-7 px-3 rounded-lg bg-brand-500/20 text-brand-300 text-[10px] font-bold border border-brand-500/30 hover:bg-brand-500/30 transition-colors shrink-0"
              >
                Stop Timer
              </button>
            </>
          ) : (
            <button
              onClick={startSleepTimer}
              className="flex items-center gap-1.5 h-7 px-3 rounded-lg bg-white/[0.04] text-white/50 text-[10px] font-bold border border-white/[0.06] hover:text-white/70 hover:bg-white/[0.08] transition-colors"
            >
              <Moon className="w-3 h-3" />
              Start Sleep Timer
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
