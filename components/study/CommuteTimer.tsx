"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Plane, Play, Pause, RotateCcw, Clock } from "lucide-react"
import { airports, calcFlightMinutes } from "@/lib/airports"

export function CommuteTimer() {
  const [fromCode, setFromCode] = useState("BOM")
  const [toCode, setToCode] = useState("BLR")
  const [countdown, setCountdown] = useState(0)
  const [totalMinutes, setTotalMinutes] = useState(0)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval>>()
  const finishedRef = useRef(false)

  const from = airports.find(a => a.code === fromCode)
  const to = airports.find(a => a.code === toCode)

  useEffect(() => {
    if (from && to) {
      const mins = calcFlightMinutes(from, to)
      setTotalMinutes(mins)
      if (!running && !finishedRef.current) {
        setCountdown(mins)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromCode, toCode])

  useEffect(() => {
    if (running && countdown > 0) {
      intervalRef.current = setInterval(() => {
        setCountdown(c => {
          if (c <= 1) {
            clearInterval(intervalRef.current)
            setRunning(false)
            finishedRef.current = true
            return 0
          }
          return c - 1
        })
      }, 1000)
    }
    return () => clearInterval(intervalRef.current)
  }, [running, countdown])

  function toggle() {
    if (running) {
      clearInterval(intervalRef.current)
      setRunning(false)
    } else {
      finishedRef.current = false
      setRunning(true)
    }
  }

  function reset() {
    clearInterval(intervalRef.current)
    setRunning(false)
    finishedRef.current = false
    if (from && to) {
      const mins = calcFlightMinutes(from, to)
      setCountdown(mins)
      setTotalMinutes(mins)
    }
  }

  const hours = Math.floor(countdown / 3600)
  const minutes = Math.floor((countdown % 3600) / 60)
  const seconds = countdown % 60

  const RING_RADIUS = 64
  const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS
  const progress = totalMinutes > 0 ? 1 - countdown / (totalMinutes * 60) : 0

  return (
    <div className="glass rounded-2xl p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <span className="section-label">
          Commute Timer
        </span>
        <Plane className="w-4 h-4 text-text-tertiary" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-mono font-extrabold tracking-widest text-text-tertiary uppercase block mb-1.5">
            From
          </label>
          <select
            value={fromCode}
            onChange={e => { setFromCode(e.target.value); finishedRef.current = false }}
            className="w-full h-11 px-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-text-primary outline-none focus:border-brand-500/40 focus:bg-white/[0.06] transition-colors appearance-none cursor-pointer"
          >
            {airports.map(a => (
              <option key={a.code} value={a.code} className="bg-[#0c0c0e]">{a.code} — {a.city}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-mono font-extrabold tracking-widest text-text-tertiary uppercase block mb-1.5">
            To
          </label>
          <select
            value={toCode}
            onChange={e => { setToCode(e.target.value); finishedRef.current = false }}
            className="w-full h-11 px-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-text-primary outline-none focus:border-brand-500/40 focus:bg-white/[0.06] transition-colors appearance-none cursor-pointer"
          >
            {airports.map(a => (
              <option key={a.code} value={a.code} className="bg-[#0c0c0e]">{a.code} — {a.city}</option>
            ))}
          </select>
        </div>
      </div>

      {from && to && (
        <div className="text-center text-[11px] font-mono text-text-tertiary">
          {from.city} → {to.city} · ~{totalMinutes} min flight
        </div>
      )}

      <div className="relative w-[144px] h-[144px] mx-auto">
        <svg viewBox="0 0 144 144" className="w-full h-full">
          <circle cx="72" cy="72" r={RING_RADIUS} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
          <motion.circle
            cx="72" cy="72" r={RING_RADIUS}
            fill="none" stroke="rgb(107,227,164)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={RING_CIRCUMFERENCE}
            initial={false}
            animate={{ strokeDashoffset: RING_CIRCUMFERENCE * (1 - progress) }}
            transition={{ duration: 0.5, ease: "linear" }}
            style={{ transform: "rotate(-90deg)", transformOrigin: "72px 72px" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[28px] font-extrabold tabular-nums text-white/90 leading-none tracking-tight">
            {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </span>
          <span className="text-[11px] font-mono text-text-tertiary mt-1">
            {finishedRef.current ? "Arrived!" : running ? "En route" : "Ready"}
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
          <RotateCcw className="w-4 h-4 text-text-tertiary" />
        </button>
        <button
          onClick={() => {
            if (from && to) {
              const mins = calcFlightMinutes(from, to)
              setCountdown(mins)
              setTotalMinutes(mins)
            }
          }}
          className="h-12 w-12 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center hover:bg-white/[0.08] transition-colors"
        >
          <Clock className="w-4 h-4 text-text-tertiary" />
        </button>
      </div>
    </div>
  )
}
