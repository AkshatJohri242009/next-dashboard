"use client"

import { useState, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import { Target, X, Play, Pause, RotateCcw, BookOpen } from "lucide-react"
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
  const setGoalProgress = useStore(s => s.setGoalProgress)

  const [timer, setTimer] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const [activeGoal, setActiveGoal] = useState<number | null>(null)

  useEffect(() => {
    if (!show) {
      setRunning(false)
      setTimer(25 * 60)
      setActiveGoal(null)
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

  const logStudyForGoal = () => {
    if (activeGoal === null || !goals[activeGoal]) return
    const g = goals[activeGoal]
    const current = g.progress || 0
    const added = Math.floor(timer / 60) // 1% per minute studied
    setGoalProgress(activeGoal, Math.min(100, current + added))
    setRunning(false)
    setTimer(25 * 60)
  }

  if (!show) return null

  return createPortal(
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 99999,
          backgroundColor: "var(--bg)",
          display: "flex",
          flexDirection: "column",
          color: "#fff",
          touchAction: "manipulation",
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
        <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <X size={16} />
        </button>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "row", overflow: "auto" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, borderRight: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: 96, fontWeight: 700, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums", marginBottom: 24 }}>
            {formatTime(timer)}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <button onClick={() => setRunning(!running)}
              style={{ width: 48, height: 48, borderRadius: "50%", border: "none", background: "var(--brand)", color: "#000", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {running ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: 2 }} />}
            </button>
            <button onClick={() => { setTimer(25 * 60); setRunning(false) }}
              style={{ height: 36, padding: "0 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
              <RotateCcw size={12} /> Reset
            </button>
            <div style={{ display: "flex", gap: 6, marginLeft: 8 }}>
              {[5, 15, 25, 30, 60].map(m => (
                <button key={m} onClick={() => { setTimer(m * 60); setRunning(false) }}
                  style={{ height: 36, padding: "0 14px", borderRadius: 12, border: "none", background: timer === m * 60 ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)", color: timer === m * 60 ? "#fff" : "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 12, fontWeight: 500 }}>
                  {m}m
                </button>
              ))}
            </div>
          </div>
          {activeGoal !== null && goals[activeGoal] && (
            <div style={{ marginTop: 24, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <BookOpen size={14} style={{ opacity: 0.4 }} />
                <span style={{ fontSize: 13, opacity: 0.5 }}>Focusing on:</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{goals[activeGoal].text}</span>
              </div>
              {running && (
                <button onClick={logStudyForGoal}
                  style={{ height: 32, padding: "0 14px", borderRadius: 10, border: "none", background: "rgba(107,227,164,0.15)", color: "#6be3a4", cursor: "pointer", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                  <BookOpen size={12} /> Log {Math.floor(timer / 60)} min to progress
                </button>
              )}
            </div>
          )}
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
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {goals.map((g, idx) => {
                const isActive = activeGoal === idx
                const pct = g.progress || 0
                return (
                  <div key={idx}
                    onClick={() => setActiveGoal(isActive ? null : idx)}
                    style={{
                    borderRadius: 16,
                    background: isActive ? "rgba(107,227,164,0.06)" : "rgba(255,255,255,0.02)",
                    border: isActive ? "1px solid rgba(107,227,164,0.25)" : "1px solid rgba(255,255,255,0.06)",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}>
                    <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", flexShrink: 0, background: g.done ? "var(--brand)" : isActive ? "#6be3a4" : "rgba(255,255,255,0.15)" }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: 14, fontWeight: isActive ? 600 : 500, opacity: g.done ? 0.3 : 0.8, textDecoration: g.done ? "line-through" : "none", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {g.text}
                        </span>
                        {pct > 0 && !g.done && (
                          <div style={{ marginTop: 6 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                              <span style={{ fontSize: 10, opacity: 0.3 }}>Progress</span>
                              <span style={{ fontSize: 10, opacity: 0.4, fontWeight: 600 }}>{pct}%</span>
                            </div>
                            <div style={{ height: 4, borderRadius: 4, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                              <div style={{ height: "100%", borderRadius: 4, background: "var(--brand)", opacity: 0.5, transition: "width 0.3s", width: `${pct}%` }} />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    {isActive && !g.done && (
                      <div style={{ padding: "4px 12px 12px 12px", display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <button onClick={(e) => { e.stopPropagation(); setGoalProgress(idx, Math.min(100, pct + 10)) }}
                          style={{ height: 26, padding: "0 10px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 10, fontWeight: 500 }}>
                          +10%
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setGoalProgress(idx, Math.min(100, pct + 25)) }}
                          style={{ height: 26, padding: "0 10px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 10, fontWeight: 500 }}>
                          +25%
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setGoalProgress(idx, 100); toggleGoal(idx) }}
                          style={{ height: 26, padding: "0 12px", borderRadius: 8, border: "none", background: "var(--brand)", color: "#000", cursor: "pointer", fontSize: 10, fontWeight: 700 }}>
                          Mark Done
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setGoalProgress(idx, 0) }}
                          style={{ height: 26, padding: "0 10px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 10, fontWeight: 500 }}>
                          Reset
                        </button>
                      </div>
                    )}
                    {isActive && g.done && (
                      <div style={{ padding: "0 12px 12px 12px" }}>
                        <span style={{ fontSize: 11, opacity: 0.4 }}>Completed ✓</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
