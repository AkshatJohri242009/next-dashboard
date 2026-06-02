"use client"

import { motion } from "framer-motion"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Line, ComposedChart } from "recharts"
import { useStore } from "@/lib/store"
import { Moon, Clock, Brain, TrendingUp } from "lucide-react"
import { useMediaQuery } from "@/lib/use-media-query"


function timeFmt(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${h}h ${m}m`
}

export function SleepTracker() {
  const { sleepLog, setAIPanel } = useStore()
  const isMobile = useMediaQuery("(max-width: 1023px)")

  const sorted = [...sleepLog].sort((a, b) => a.date.localeCompare(b.date))
  const chartData = sorted.map((e, i, arr) => {
    const window = arr.slice(Math.max(0, i - 6), i + 1)
    const avg = window.reduce((s, x) => s + x.minutes, 0) / window.length
    return {
      date: e.date.slice(5),
      hours: Math.round((e.minutes / 60) * 10) / 10,
      minutes: e.minutes,
      movingAvg: Math.round((avg / 60) * 10) / 10,
    }
  })

  const last7 = sorted.slice(-7)
  const goodDays = last7.filter(e => e.minutes >= 420 && e.minutes <= 540).length
  const consistency = last7.length > 0 ? Math.round((goodDays / last7.length) * 100) : 0
  const avg = last7.length > 0 ? Math.round(last7.reduce((s, e) => s + e.minutes, 0) / last7.length) : 0
  const latest = sorted.length > 0 ? sorted[sorted.length - 1] : null

  const statusText = avg >= 420 && avg <= 540 ? "Healthy range" : avg < 420 ? "Too little sleep" : "Too much sleep"
  const statusColor = avg >= 420 && avg <= 540 ? "text-brand-400" : avg < 420 ? "text-red-400" : "text-amber-400"

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-strong rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Moon className="w-3.5 h-3.5 text-accent-400" />
            <span className="text-[10px] font-mono font-extrabold tracking-widest text-white/30 uppercase">Latest</span>
          </div>
          {latest ? (
            <div>
              <span className="text-[28px] sm:text-[32px] font-bold tabular-nums">{timeFmt(latest.minutes)}</span>
              <span className="text-xs text-white/40 ml-2 font-mono">{latest.date}</span>
            </div>
          ) : (
            <span className="text-sm text-white/30 italic">No data yet</span>
          )}
        </div>

        <div className="glass-strong rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-3.5 h-3.5 text-brand-400" />
            <span className="text-[10px] font-mono font-extrabold tracking-widest text-white/30 uppercase">7-day Avg</span>
          </div>
          {last7.length > 0 ? (
            <div>
              <span className="text-[28px] sm:text-[32px] font-bold tabular-nums">{timeFmt(avg)}</span>
              <span className={`text-xs font-bold ml-2 ${statusColor}`}>{statusText}</span>
            </div>
          ) : (
            <span className="text-sm text-white/30 italic">Need more data</span>
          )}
        </div>

        <div className="glass-strong rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-3.5 h-3.5 text-brand-400" />
            <span className="text-[10px] font-mono font-extrabold tracking-widest text-white/30 uppercase">Consistency</span>
          </div>
          {last7.length > 0 ? (
            <div>
              <span className="text-[28px] sm:text-[32px] font-bold tabular-nums">{consistency}%</span>
              <span className={`text-xs font-bold ml-2 ${consistency >= 70 ? "text-brand-400" : consistency >= 40 ? "text-amber-400" : "text-red-400"}`}>
                {goodDays}/{last7.length} good days
              </span>
            </div>
          ) : (
            <span className="text-sm text-white/30 italic">Need more data</span>
          )}
        </div>

        <div className="glass-strong rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px] font-mono font-extrabold tracking-widest text-white/30 uppercase">AI Advice</span>
          </div>
          <button
            onClick={() => setAIPanel(true)}
            className="text-sm text-white/60 hover:text-brand-400 transition-colors text-left py-2"
          >
            {avg < 420
              ? `Averaging ${timeFmt(avg)} — below the 7-9h range.`
              : avg > 540
              ? `Averaging ${timeFmt(avg)} — oversleeping.`
              : `${timeFmt(avg)} avg — good range.`}
          </button>
        </div>
      </div>

      {chartData.length > 1 && (
        <div className="glass-strong rounded-xl p-4">
          <span className="text-[11px] font-mono font-bold text-white/30 mb-3 block uppercase">Sleep History</span>
          <ResponsiveContainer width="100%" height={isMobile ? 180 : 250}>
            <ComposedChart data={chartData} margin={{ top: 4, right: 4, left: isMobile ? 4 : -16, bottom: 4 }}>
              <defs>
                <linearGradient id="sleepAvgLine" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#6be3a4" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#6be3a4" stopOpacity={0.4} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 12]} tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}h`} />
              <Tooltip
                contentStyle={{ background: "rgba(8,8,9,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px", color: "#fff" }}
                formatter={(value: number, name: string) => {
                  if (name === "hours") return [`${value}h`, "Sleep"]
                  if (name === "movingAvg") return [`${value}h`, "7-day Avg"]
                  return [value, name]
                }}
              />
              <Bar dataKey="hours" radius={[4, 4, 0, 0]} maxBarSize={32}>
                {chartData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.hours >= 7 && entry.hours <= 9 ? "#6be3a4" : entry.hours < 7 ? "#ff6b6b" : "#fcc419"}
                  />
                ))}
              </Bar>
              <Line type="monotone" dataKey="movingAvg" stroke="url(#sleepAvgLine)" strokeWidth={2} dot={false} strokeDasharray="4 3" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {sorted.length === 0 && (
        <div className="py-12 text-center text-sm text-white/30 italic">
          No sleep data yet. Use the Sleep Timer on the Dashboard to start tracking.
        </div>
      )}

      {sorted.length > 0 && (
        <div className="space-y-1">
          <span className="text-[11px] font-mono font-bold text-white/30 block mb-2 uppercase">All Entries</span>
          {sorted.slice().reverse().map(e => (
            <div key={e.date} className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <span className="text-sm text-white/80">{e.date}</span>
              <span className="text-sm font-bold font-mono tabular-nums" style={{
                color: e.minutes >= 420 && e.minutes <= 540 ? "#6be3a4" : e.minutes < 420 ? "#ff6b6b" : "#fcc419"
              }}>
                {timeFmt(e.minutes)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
