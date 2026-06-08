"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import { StockList } from "@/components/stocks/StockList"
import { StockDetail } from "@/components/stocks/StockDetail"
import { JarvisInsightBar } from "@/components/life/JarvisInsightBar"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { useStore } from "@/lib/store"

export default function StocksPageClient() {
  const { stockExpandedSymbol, setStockExpanded, loadStocks, fetchStockQuotes, stockHoldings } = useStore()

  useEffect(() => {
    loadStocks()
  }, [loadStocks])

  useEffect(() => {
    if (stockHoldings.length > 0) fetchStockQuotes()
  }, [stockHoldings.length, fetchStockQuotes])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gradient">Stock Portfolio</h1>
        <p className="text-sm text-white/40 mt-1">Track your stock holdings and monitor performance.</p>
      </div>

      <JarvisInsightBar />

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <GlassPanel variant="strong" glow="brand">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-4 rounded-full bg-brand-400" />
            <span className="section-label">Portfolio</span>
          </div>
          <StockList />
        </GlassPanel>
      </motion.div>

      {stockExpandedSymbol && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <GlassPanel variant="strong" glow="accent">
            <StockDetail symbol={stockExpandedSymbol} onClose={() => setStockExpanded(null)} />
          </GlassPanel>
        </motion.div>
      )}
    </motion.div>
  )
}
