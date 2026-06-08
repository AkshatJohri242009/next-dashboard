"use client"

import { useMemo } from "react"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from "recharts"
import { TrendingUp, TrendingDown } from "lucide-react"
import type { JournalEntry } from "@/lib/types"

const MOOD_SCORE: Record<string, number> = { great: 5, good: 4, okay: 3, bad: 2, awful: 1 }
const MOOD_COLOR: Record<string, string> = { great: "var(--success)", good: "var(--brand)", okay: "var(--warning)", bad: "var(--danger)", awful: "var(--danger)" }

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

interface DataPoint {
  date: string
  displayDate: string
  score: number | null
  avg7: number | null
  mood: string | null
  count: number
}

export function MoodTrendChart({ entries }: { entries: JournalEntry[] }) {
  const data = useMemo(() => {
    const today = new Date()
    const days: DataPoint[] = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const key = formatDate(d)
      const dayEntries = entries.filter(e => e.date.startsWith(key))
      const scores = dayEntries.map(e => MOOD_SCORE[e.mood] || 3)
      const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null
      const bestMood = scores.length > 0
        ? Object.entries(MOOD_SCORE).find(([_, v]) => v === Math.round(avg!))?.[0] || null
        : null
      days.push({
        date: key,
        displayDate: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        score: avg,
        avg7: null,
        mood: bestMood,
        count: scores.length,
      })
    }

    for (let i = 0; i < days.length; i++) {
      if (i < 6) continue
      const window = days.slice(i - 6, i + 1)
      const scores = window.map(w => w.score).filter((s): s is number => s !== null)
      days[i].avg7 = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null
    }
    return days
  }, [entries])

  const latest = data[data.length - 1]
  const prev = data.length > 1 ? data[data.length - 2] : null
  const trend = latest && latest.score !== null && prev && prev.score !== null
    ? latest.score > prev.score ? "up" : latest.score < prev.score ? "down" : "stable"
    : "stable"

  return (
    <div className="card-elevated p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <TrendingUp className="w-4 h-4 text-accent" />
          <h3 className="section-heading">Mood Trend</h3>
        </div>
        {trend !== "stable" && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trend === "up" ? "text-semantic-success" : "text-semantic-danger"}`}>
            {trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend === "up" ? "Improving" : "Declining"}
          </div>
        )}
      </div>

      <div className="h-[180px] sm:h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="displayDate" tick={{ fontSize: 10, fill: "var(--text-tertiary)" }} interval="preserveStartEnd" minTickGap={40} />
            <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 10, fill: "var(--text-tertiary)" }} tickFormatter={(v: number) => ["", "Awful", "Bad", "Okay", "Good", "Great"][v] || ""} />
            <Tooltip
              contentStyle={{
                background: "rgba(0,0,0,0.85)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                fontSize: "12px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              }}
              labelStyle={{ color: "var(--text-secondary)", marginBottom: 4 }}
              formatter={(value: number, name: string) => {
                const label = ["Awful", "Bad", "Okay", "Good", "Great"][Math.round(value) - 1] || "Unknown"
                return [label, name === "score" ? "Mood" : "7-day avg"]
              }}
            />
            <ReferenceLine y={3} stroke="var(--text-muted)" strokeDasharray="4 4" strokeOpacity={0.3} />
            {data.filter(d => d.score !== null).map((d, i) => (
              d.score !== null && (
                <Line key={`dot-${d.date}`} dataKey="score" stroke="transparent" dot={{ r: 3, fill: MOOD_COLOR[d.mood || "okay"] || "var(--warning)", opacity: 0.7 }} activeDot={{ r: 5, strokeWidth: 0 }} isAnimationActive={false} />
              )
            ))}
            <Line type="monotone" dataKey="score" stroke="var(--accent)" strokeWidth={1.5} dot={false} connectNulls name="score" />
            <Line type="monotone" dataKey="avg7" stroke="var(--brand)" strokeWidth={2} strokeDasharray="4 3" dot={false} name="avg7" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center gap-4 mt-3 text-xs text-text-tertiary">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 rounded bg-accent" />
          <span>Daily mood</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 rounded bg-brand" />
          <span>7-day avg</span>
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          {Object.entries(MOOD_SCORE).map(([mood, score]) => (
            <span key={mood} className="inline-flex items-center gap-1 text-[10px]">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: MOOD_COLOR[mood] }} />
              <span className="hidden sm:inline">{mood}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
