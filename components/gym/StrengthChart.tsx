"use client"

import { useStore } from "@/lib/store"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"

export function StrengthChart() {
  const logs = useStore(s => s.gym.logs)
  const exercises = [...new Set(logs.map(l => l.exercise))].slice(0, 3)

  if (exercises.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {["Bench Press", "Squat", "Deadlift"].map(ex => (
          <div key={ex} className="rounded-xl p-4 bg-white/[0.02] border border-white/[0.06]">
            <div className="text-[11px] font-mono font-bold text-white/30 mb-3">{ex}</div>
            <div className="h-[80px] flex items-center justify-center text-xs text-white/20">
              Add more logs
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {exercises.map(ex => {
        const data = logs
          .filter(l => l.exercise === ex)
          .map((l, i) => ({ set: i + 1, weight: l.weight }))

        return (
          <div key={ex} className="rounded-xl p-4 bg-white/[0.02] border border-white/[0.06]">
            <div className="text-[11px] font-mono font-bold text-white/30 mb-3">{ex}</div>
            {data.length < 2 ? (
              <div className="h-[80px] flex items-center justify-center text-xs text-white/20">
                Add more logs
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={80}>
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id={`grad-${ex}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6be3a4" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#6be3a4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="set" hide />
                  <YAxis hide domain={["dataMin - 5", "dataMax + 5"]} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(8,8,9,0.9)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "#fff",
                    }}
                    formatter={(value: number) => [`${value}kg`, "Weight"]}
                  />
                  <Area type="monotone" dataKey="weight" stroke="#6be3a4" strokeWidth={2} fill={`url(#grad-${ex})`} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        )
      })}
    </div>
  )
}
