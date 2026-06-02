"use client"

import { useState, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import { Target, X, Play, Pause, RotateCcw } from "lucide-react"
import { useStore } from "@/lib/store"

export function useFocusOverlay() {
  const [show, setShow] = useState(false)
  const open = useCallback(() => setShow(true), [])
  const close = useCallback(() => setShow(false), [])
  return { show, open, close }
}

export function FocusOverlay({ show, onClose }: { show: boolean; onClose: () => void }) {
  const goals = useStore(s => s.goals)
  const toggleGoal = useStore(s => s.toggleGoal)
  const loadGoals = useStore(s => s.loadGoals)
  const [timer, setTimer] = useState(25 * 60)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    if (!show) {
      setRunning(false)
      setTimer(25 * 60)
      return
    }
    loadGoals()
  }, [show, loadGoals])

  useEffect(() => {
    if (!running || !show) return
    const interval = setInterval(() => {
      setTimer(t => {
        if (t <= 1) { setRunning(false); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [running, show])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`
  }

  if (!show) return null

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        backgroundColor: "#050506",
        display: "flex",
        flexDirection: "column",
        color: "#fff",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          height: 56,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Target size={16} color="var(--brand)" />
          <span style={{ fontSize: 14, fontWeight: 700, opacity: 0.7 }}>Focus Mode</span>
        </div>
        <button
          onClick={onClose}
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            border: "none",
            background: "rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.7)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <X size={16} />
        </button>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "row", overflow: "auto" }}>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 32,
            borderRight: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div
            style={{
              fontSize: 96,
              fontWeight: 700,
              letterSpacing: "-0.03em",
              fontVariantNumeric: "tabular-nums",
              marginBottom: 24,
            }}
          >
            {formatTime(timer)}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <button
              onClick={() => setRunning(!running)}
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                border: "none",
                background: "var(--brand)",
                color: "#000",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {running ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: 2 }} />}
            </button>
            <button
              onClick={() => { setTimer(25 * 60); setRunning(false) }}
              style={{
                height: 36,
                padding: "0 16px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.05)",
                color: "rgba(255,255,255,0.5)",
                cursor: "pointer",
                fontSize: 12,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <RotateCcw size={12} /> Reset
            </button>
            <div style={{ display: "flex", gap: 6, marginLeft: 8 }}>
              {[5, 15, 25, 30, 60].map(m => (
                <button
                  key={m}
                  onClick={() => { setTimer(m * 60); setRunning(false) }}
                  style={{
                    height: 36,
                    padding: "0 14px",
                    borderRadius: 12,
                    border: "none",
                    background: timer === m * 60 ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)",
                    color: timer === m * 60 ? "#fff" : "rgba(255,255,255,0.4)",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ width: 384, padding: "24px 32px", overflow: "auto" }}>
          <div style={{ fontSize: 12, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", opacity: 0.4, marginBottom: 16 }}>
            Today&apos;s Tasks <span style={{ opacity: 0.5 }}>({goals.length})</span>
          </div>
          {goals.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 0", textAlign: "center" }}>
              <Target size={32} style={{ opacity: 0.1, marginBottom: 12 }} />
              <p style={{ fontSize: 14, opacity: 0.2 }}>No tasks for today</p>
              <p style={{ fontSize: 12, opacity: 0.1, marginTop: 4 }}>Add goals in the dashboard to focus on them here</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {goals.map((g, idx) => (
                <div key={idx} style={{ borderRadius: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", padding: 16, display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => toggleGoal(idx)}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", flexShrink: 0, background: g.done ? "var(--brand)" : "rgba(255,255,255,0.15)" }} />
                  <span style={{ fontSize: 14, fontWeight: 500, opacity: g.done ? 0.3 : 0.8, textDecoration: g.done ? "line-through" : "none" }}>
                    {g.text}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
