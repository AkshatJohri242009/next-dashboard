"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { SleepTracker } from "@/components/sleep/SleepTracker"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { JarvisInsightBar } from "@/components/life/JarvisInsightBar"
import { useStore } from "@/lib/store"
import { Moon, Play, Square, Clock } from "lucide-react"

export default function SleepPage() {
  const { sleepTimerStart, startSleepTimer, stopSleepTimer } = useStore()
  const [starting, setStarting] = useState(false)

  const handleStart = async () => {
    setStarting(true)
    await startSleepTimer()
    setStarting(false)
  }

  const elapsed = sleepTimerStart ? Math.floor((Date.now() - sleepTimerStart) / 60000) : 0
  const elapsedH = Math.floor(elapsed / 60)
  const elapsedM = elapsed % 60

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
          Track your sleep, view patterns, and get AI advice.
        </p>
      </div>

      <JarvisInsightBar />

      {/* Sleep Timer Controls */}
      <GlassPanel variant="strong" glow="accent">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-4 rounded-full bg-accent-400" />
          <span className="text-[10px] font-mono font-extrabold tracking-widest text-white/30 uppercase">Sleep Timer</span>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {sleepTimerStart ? (
            <>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-accent-400" />
                </div>
                <div>
                  <p className="text-xs text-white/40">Timer running</p>
                  <p className="text-lg font-bold tabular-nums text-accent-400">{elapsedH}h {elapsedM}m</p>
                </div>
              </div>
              <button onClick={stopSleepTimer}
                className="h-10 px-5 rounded-xl bg-danger/20 hover:bg-danger/30 border border-danger/30 text-danger text-sm font-medium transition-all flex items-center gap-2"
              >
                <Square className="w-4 h-4" /> Wake Up
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 text-white/40">
                <Moon className="w-8 h-8" />
                <p className="text-sm">No timer active. Start tracking when you go to bed.</p>
              </div>
              <button onClick={handleStart} disabled={starting}
                className="h-10 px-5 rounded-xl bg-accent/20 hover:bg-accent/30 border border-accent/30 text-accent text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-40"
              >
                <Play className="w-4 h-4" /> {starting ? "Starting..." : "Start Sleep Timer"}
              </button>
            </>
          )}
        </div>
      </GlassPanel>

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
