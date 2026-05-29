"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Trash2, TrendingUp, TrendingDown, Minus, Flame } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ComposedChart, Area, Line, Cell } from "recharts"
import { toDateString } from "@/lib/utils"
import { useMediaQuery } from "@/lib/use-media-query"
import { markModified, useStore } from "@/lib/store"

interface WeightEntry {
  date: string
  weight: number
  note?: string
}

export function WeightTracker() {
  const syncCount = useStore(s => s.syncCount)
  const [entries, setEntries] = useState<WeightEntry[]>([])
  const [weight, setWeight] = useState("")
  const [note, setNote] = useState("")
  const isMobile = useMediaQuery("(max-width: 1023px)")

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("weight_entries_v1") || "[]")
      if (Array.isArray(saved)) setEntries(saved)
    } catch {}
  }, [syncCount])

  const save = (next: WeightEntry[]) => {
    setEntries(next)
    localStorage.setItem("weight_entries_v1", JSON.stringify(next))
    localStorage.setItem("_ts:weight_entries_v1", new Date().toISOString())
    markModified("weight_entries_v1")
  }

  const add = () => {
    const w = parseFloat(weight)
    if (!w || w < 20 || w > 300) return
    const next = [...entries, { date: toDateString(new Date()), weight: w, note: note || undefined }]
    save(next)
    setWeight("")
    setNote("")
  }

  const remove = (idx: number) => {
    save(entries.filter((_, i) => i !== idx))
  }

  const latest = entries.length > 0 ? entries[entries.length - 1].weight : null
  const prev = entries.length > 1 ? entries[entries.length - 2].weight : null
  const change = latest !== null && prev !== null ? (latest - prev).toFixed(1) : null

  const chartData = entries.map((e, i, arr) => {
    const window = arr.slice(Math.max(0, i - 6), i + 1)
    const avg = window.reduce((s, x) => s + x.weight, 0) / window.length
    return { set: i + 1, weight: e.weight, date: e.date, movingAvg: Math.round(avg * 10) / 10 }
  })

  let streak = 0
  if (entries.length > 0) {
    const today = new Date()
    for (let i = 0; i < 365; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const key = toDateString(d)
      if (entries.some(e => e.date === key)) streak++
      else break
    }
  }

  const last7 = entries.slice(-7)
  const weekAvg = last7.length > 0 ? last7.reduce((s, e) => s + e.weight, 0) / last7.length : 0
  const first7 = last7.length > 0 ? last7[0].weight : 0
  const weekDelta = weekAvg > 0 ? (latest || 0) - first7 : 0

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-[36px] sm:text-[42px] font-bold leading-none tracking-tight tabular-nums">{latest || "--"}</span>
            <span className="text-lg text-white/30">kg</span>
            {change !== null && (
              <span className={`flex items-center gap-1 text-sm font-bold ml-2 ${Number(change) > 0 ? "text-red-400" : Number(change) < 0 ? "text-brand-400" : "text-white/30"}`}>
                {Number(change) > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : Number(change) < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                {Math.abs(Number(change))}kg
              </span>
            )}
          </div>
          <span className="text-xs text-white/40">{entries.length} entries</span>
        </div>
        <div>
          <span className="text-[10px] font-mono font-extrabold tracking-widest text-white/30 uppercase">Streak</span>
          <div className="mt-1 flex items-baseline gap-1">
            <Flame className="w-4 h-4 text-brand-400 inline" />
            <span className="text-[28px] sm:text-[32px] font-bold tabular-nums">{streak}</span>
            <span className="text-xs text-white/40">days</span>
          </div>
        </div>
        {entries.length >= 7 && (
          <>
            <div>
              <span className="text-[10px] font-mono font-extrabold tracking-widest text-white/30 uppercase">7-day Avg</span>
              <div className="mt-1">
                <span className="text-[28px] font-bold tabular-nums">{weekAvg.toFixed(1)}</span>
                <span className="text-xs text-white/30 ml-1">kg</span>
              </div>
            </div>
            <div>
              <span className="text-[10px] font-mono font-extrabold tracking-widest text-white/30 uppercase">7-day Trend</span>
              <div className="mt-1">
                <span className={`text-[28px] font-bold tabular-nums ${weekDelta > 0 ? "text-red-400" : weekDelta < 0 ? "text-brand-400" : "text-white/60"}`}>
                  {weekDelta > 0 ? "+" : ""}{weekDelta.toFixed(1)}
                </span>
                <span className="text-xs text-white/30 ml-1">kg</span>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 items-end">
        <label className="flex flex-col gap-1">
          <span className="text-[10px] font-mono font-extrabold tracking-wider text-white/30 uppercase">Weight (kg)</span>
          <input type="number" min={20} max={300} step={0.1} value={weight}
            onChange={e => setWeight(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") add() }}
            className="h-10 w-full sm:w-24 px-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-white outline-none focus:border-white/20 transition-colors" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[10px] font-mono font-extrabold tracking-wider text-white/30 uppercase">Note</span>
          <input value={note} onChange={e => setNote(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") add() }}
            placeholder="Optional..."
            className="h-10 w-full sm:w-40 px-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-white outline-none placeholder:text-white/30 focus:border-white/20 transition-colors" />
        </label>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={add}
          className="col-span-2 sm:col-auto h-10 px-4 rounded-xl bg-brand-500 text-black text-sm font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-brand-500/20"
        >
          <Plus className="w-4 h-4" />
          Log
        </motion.button>
      </div>

      {entries.length > 1 && (
        <>
          <div className="glass-strong rounded-xl p-4">
            <div className="text-[11px] font-mono font-bold text-white/30 mb-3 uppercase">Weight Trend</div>
            <ResponsiveContainer width="100%" height={isMobile ? 180 : 200}>
              <ComposedChart data={chartData}>
                <defs>
                  <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6be3a4" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#6be3a4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={["dataMin - 2", "dataMax + 2"]} tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "rgba(8,8,9,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px", color: "#fff" }}
                  formatter={(value: number, name: string) => {
                    if (name === "weight") return [`${value}kg`, "Weight"]
                    if (name === "movingAvg") return [`${value}kg`, "7-day Avg"]
                    return [value, name]
                  }}
                />
                <Area type="monotone" dataKey="weight" stroke="#6be3a4" strokeWidth={2} fill="url(#weightGrad)" dot={{ fill: "#6be3a4", r: 3 }} />
                <Line type="monotone" dataKey="movingAvg" stroke="#fcc419" strokeWidth={2} dot={false} strokeDasharray="4 3" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-strong rounded-xl p-4">
            <div className="text-[11px] font-mono font-bold text-white/30 mb-3 uppercase">Changes</div>
            <ResponsiveContainer width="100%" height={isMobile ? 150 : 180}>
              <BarChart data={chartData.slice(1).map((d, i) => ({ ...d, change: d.weight - chartData[i].weight }))}>
                <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "rgba(8,8,9,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px", color: "#fff" }}
                  formatter={(value: number) => [`${value > 0 ? "+" : ""}${value.toFixed(1)}kg`, "Change"]}
                />
                <Bar dataKey="change" radius={[4, 4, 0, 0]} maxBarSize={24}>
                  {chartData.slice(1).map((d, i) => {
                    const delta = d.weight - chartData[i].weight
                    return <Cell key={i} fill={delta > 0 ? "#ff6b6b" : delta < 0 ? "#6be3a4" : "#888"} />
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      <div className="space-y-1">
        {entries.slice().reverse().map((e, ri) => {
          const idx = entries.length - 1 - ri
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.06]"
            >
              <div>
                <span className="text-sm font-bold text-white/80">{e.weight} kg</span>
                <span className="text-xs text-white/40 ml-3 font-mono">{e.date}</span>
                {e.note && <span className="text-xs text-white/30 ml-2">· {e.note}</span>}
              </div>
              <button onClick={() => remove(idx)} className="h-9 w-9 sm:h-7 sm:w-7 rounded-xl sm:rounded-lg flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-colors">
                <Trash2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
              </button>
            </motion.div>
          )
        })}
        {entries.length === 0 && (
          <div className="py-8 text-center text-sm text-white/30 italic">No weight entries yet. Log your first one above.</div>
        )}
      </div>
    </div>
  )
}
