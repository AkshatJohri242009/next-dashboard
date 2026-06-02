"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Trash2, TrendingUp, TrendingDown, Search, X, RefreshCw } from "lucide-react"
import { useStore } from "@/lib/store"
import { currencySymbol } from "@/lib/utils"
import type { StockHolding } from "@/lib/types"

interface SearchResult {
  symbol: string
  name: string
  exchange: string
  type: string
}

export function StockList() {
  const { stockHoldings, stockQuotes, stockExpandedSymbol, addStock, removeStock, setStockExpanded, fetchStockQuotes } = useStore()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [shares, setShares] = useState("")
  const [buyPrice, setBuyPrice] = useState("")
  const [selected, setSelected] = useState<SearchResult | null>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  useEffect(() => {
    if (query.length < 1 || selected) { setResults([]); return }
    setSearching(true)
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/stock/search?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setResults(data.results || [])
        setShowResults(true)
      } catch { setResults([]) }
      setSearching(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [query, selected])

  const handleSelect = (r: SearchResult) => {
    setSelected(r)
    setQuery(`${r.symbol} — ${r.name}`)
    setShowResults(false)
  }

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selected) return
    const sh = parseFloat(shares)
    if (!sh || sh <= 0) return
    addStock(selected.symbol, sh, buyPrice ? parseFloat(buyPrice) : undefined)
    setQuery("")
    setShares("")
    setBuyPrice("")
    setSelected(null)
    setResults([])
  }

  const totalValue = stockHoldings.reduce((sum, h) => {
    const q = stockQuotes[h.symbol]
    return sum + (q?.price ?? 0) * h.shares
  }, 0)

  const totalCost = stockHoldings.reduce((sum, h) => {
    return sum + (h.buyPrice ?? 0) * h.shares
  }, 0)

  const totalReturn = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="glass rounded-xl px-4 py-3">
          <span className="text-[10px] font-mono font-extrabold tracking-widest text-white/30 uppercase">Holdings</span>
          <p className="text-xl font-bold text-white/90 mt-1">{stockHoldings.length}</p>
        </div>
        <div className="glass rounded-xl px-4 py-3">
          <span className="text-[10px] font-mono font-extrabold tracking-widest text-white/30 uppercase">Value</span>
          <p className="text-xl font-bold text-white/90 mt-1">
            {stockHoldings.length > 0
              ? `${currencySymbol(stockQuotes[stockHoldings[0].symbol]?.currency)}${totalValue.toFixed(2)}`
              : "$0.00"}
          </p>
        </div>
        <div className="glass rounded-xl px-4 py-3">
          <span className="text-[10px] font-mono font-extrabold tracking-widest text-white/30 uppercase">Return</span>
          <p className={`text-xl font-bold mt-1 ${totalReturn >= 0 ? "text-brand-400" : "text-red-400"}`}>
            {totalReturn >= 0 ? "+" : ""}{totalReturn.toFixed(1)}%
          </p>
        </div>
      </div>

      <form onSubmit={handleAdd} className="flex flex-wrap gap-2">
        <div ref={searchRef} className="relative w-full sm:flex-1 sm:min-w-[160px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
            <input
              value={query}
              onChange={e => { setQuery(e.target.value); setSelected(null) }}
            placeholder="Search stocks..."
            className="w-full h-10 sm:h-10 pl-9 pr-8 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-white/80 placeholder:text-white/20 outline-none focus:border-brand-500/40 transition-colors"
            />
            {query && (
              <button type="button" onClick={() => { setQuery(""); setSelected(null); setResults([]) }} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/40">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <AnimatePresence>
            {showResults && results.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.96 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute left-0 right-0 top-full mt-1 z-10 bg-[#050506] rounded-xl border border-white/[0.08] shadow-2xl max-h-48 overflow-y-auto"
              >
                {results.map((r, i) => (
                  <motion.button
                    key={r.symbol}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.025 }}
                    type="button"
                    onClick={() => handleSelect(r)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-white/[0.04] transition-colors"
                  >
                    <span className="text-sm font-bold text-white/80">{r.symbol}</span>
                    <span className="text-[11px] text-white/30 flex-1 truncate">{r.name}</span>
                    <span className="text-[10px] text-white/20 font-mono">{r.exchange}</span>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          {searching && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <div className="w-3.5 h-3.5 border-2 border-brand-400/30 border-t-brand-400 rounded-full animate-spin" />
            </motion.div>
          )}
        </div>
        <input
          value={shares}
          onChange={e => setShares(e.target.value)}
          placeholder="Shares"
          type="number"
          step="any"
          min="0"
          className="flex-1 min-w-[80px] h-10 px-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-white/80 placeholder:text-white/20 outline-none focus:border-brand-500/40 transition-colors"
        />
        <input
          value={buyPrice}
          onChange={e => setBuyPrice(e.target.value)}
          placeholder="Buy price (opt)"
          type="number"
          step="any"
          min="0"
          className="flex-1 min-w-[80px] h-10 px-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-white/80 placeholder:text-white/20 outline-none focus:border-brand-500/40 transition-colors"
        />
        <button
          type="submit"
          disabled={!selected}
          className="h-10 px-4 rounded-xl bg-brand-500/20 text-brand-300 text-xs font-bold border border-brand-500/30 hover:bg-brand-500/30 transition-colors flex items-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </form>

      <div className="space-y-1.5">
        {stockHoldings.length === 0 && (
          <p className="text-sm text-white/30 text-center py-8">No stocks tracked yet. Search and add a ticker above.</p>
        )}
        <button
          onClick={fetchStockQuotes}
          className="text-[11px] text-white/20 hover:text-white/40 hover:scale-[1.02] active:scale-[0.95] transition-all mb-1 flex items-center gap-1"
        >
          <RefreshCw className="w-3 h-3" /> Refresh quotes
        </button>
        <AnimatePresence>
          {stockHoldings.map((h) => {
          const q = stockQuotes[h.symbol]
          const expanded = stockExpandedSymbol === h.symbol
          const value = q ? q.price * h.shares : 0
          const gain = q && h.buyPrice ? ((q.price - h.buyPrice) / h.buyPrice) * 100 : 0
          return (
            <motion.div
              key={h.symbol}
              layout
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="glass rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setStockExpanded(expanded ? null : h.symbol)}
                className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 text-left hover:bg-white/[0.03] active:scale-[0.995] transition-all"
              >
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-bold text-white/80">{h.symbol}</span>
                  {q?.name && <span className="hidden sm:inline text-[11px] text-white/30 ml-2 truncate">{q.name}</span>}
                </div>
                <div className="text-right shrink-0">
                  <span className="text-sm font-bold text-white/90 block">
                    {q ? `${currencySymbol(q.currency)}${q.price.toFixed(2)}` : "—"}
                  </span>
                  {q && (
                    <span className={`text-[10px] sm:text-[11px] font-mono flex items-center gap-0.5 justify-end ${
                      q.change >= 0 ? "text-brand-400" : "text-red-400"
                    }`}>
                      {q.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      <span className="hidden sm:inline">{q.change >= 0 ? "+" : ""}{q.change.toFixed(2)} </span>
                      ({q.changePercent >= 0 ? "+" : ""}{q.changePercent.toFixed(2)}%)
                    </span>
                  )}
                </div>
                <span className="text-xs sm:text-sm font-bold text-white/70 min-w-[60px] sm:min-w-[80px] text-right">
                  {q ? `${currencySymbol(q.currency)}${value.toFixed(2)}` : "—"}
                </span>
                {h.buyPrice && (
                  <span className={`hidden sm:block text-xs font-mono min-w-[60px] text-right ${
                    gain >= 0 ? "text-brand-400" : "text-red-400"
                  }`}>
                    {gain >= 0 ? "+" : ""}{gain.toFixed(1)}%
                  </span>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); removeStock(h.symbol) }}
                  className="h-8 w-8 flex items-center justify-center text-white/20 hover:text-red-400 transition-colors shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </button>
            </motion.div>
          )
        })}
        </AnimatePresence>
      </div>
    </div>
  )
}
