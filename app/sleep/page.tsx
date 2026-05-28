"use client"

import { motion } from "framer-motion"
import { SleepTracker } from "@/components/sleep/SleepTracker"
import { GlassPanel } from "@/components/ui/GlassPanel"

export default function SleepPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gradient">Sleep Tracker</h1>
        <p className="text-sm text-white/40 mt-1">
          Tracked via the sleep timer on the Dashboard. View patterns and get AI advice.
        </p>
      </div>

      <GlassPanel variant="strong" glow="accent">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-4 rounded-full bg-accent-400" />
          <span className="text-[10px] font-mono font-extrabold tracking-widest text-white/30 uppercase">Sleep Log</span>
        </div>
        <SleepTracker />
      </GlassPanel>
    </motion.div>
  )
}
