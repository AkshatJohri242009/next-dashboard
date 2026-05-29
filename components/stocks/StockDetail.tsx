"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { X } from "lucide-react"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import type { StockHistoryPoint } from "@/lib/types"

const RANGES = [
  { label: "1D", value: "1d" },
  { label: "5D", value: "5d" },
  { label: "1M", value: "1mo" },
  { label: "3M", value: "3mo" },
  { label: "1Y", value: "1y" },
  { label: "5Y", value: "5y" },
]

interface Props {
  symbol: string
  onClose: () => void
}

export function StockDetail({ symbol, onClose }: Props) {
  const [history, setHistory] = useState<StockHistoryPoint[]>([])
  const [range, setRange] = useState("1mo")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/stock/history?symbol=${symbol}&range=${range}`)
      .then(r => r.json())
      .then(data => setHistory(data.points || []))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false))
  }, [symbol, range])

  const change = history.length >= 2
    ? ((history[history.length - 1].close - history[0].close) / history[0].close) * 100
    : 0

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="px-4 py-4 border-t border-white/[0.06] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-white/80">{symbol} History</span>
          <button onClick={onClose} className="h-8 w-8 flex items-center justify-center text-white/20 hover:text-white/60 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-2">
          {RANGES.map(r => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`h-7 px-2.5 rounded-lg text-[10px] font-bold font-mono tracking-wider transition-colors ${
                range === r.value
                  ? "bg-brand-500/20 text-brand-300 border border-brand-500/30"
                  : "text-white/30 hover:text-white/60 border border-transparent"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="flex items-baseline gap-2">
          {history.length > 0 && (
            <>
              <span className="text-lg font-bold text-white/90">${history[history.length - 1].close.toFixed(2)}</span>
              <span className={`text-xs font-mono ${change >= 0 ? "text-brand-400" : "text-red-400"}`}>
                {change >= 0 ? "+" : ""}{change.toFixed(2)}%
              </span>
            </>
          )}
        </div>

        {loading ? (
          <div className="h-[200px] flex items-center justify-center text-sm text-white/20">Loading...</div>
        ) : history.length > 0 ? (
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id={`stockGrad_${symbol}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgb(107,227,164)" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="rgb(107,227,164)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tick={false}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={["auto", "auto"]}
                  tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }}
                  axisLine={false}
                  tickLine={false}
                  width={50}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgba(5,5,6,0.95)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, "Close"]}
                />
                <Area
                  type="monotone"
                  dataKey="close"
                  stroke="rgb(107,227,164)"
                  strokeWidth={2}
                  fill={`url(#stockGrad_${symbol})`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-sm text-white/20">No data available</div>
        )}
      </div>
    </motion.div>
  )
}
