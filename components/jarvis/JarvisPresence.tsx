"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bot } from "lucide-react"

const INSIGHTS = [
  "Scanning your day...",
  "Analyzing patterns...",
  "Tracking progress...",
  "Monitoring habits...",
  "Calculating trajectories...",
  "Reviewing goals...",
  "Syncing memories...",
  "Optimizing recommendations...",
]

export function JarvisPresence() {
  const [message, setMessage] = useState(INSIGHTS[0])
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const showTimer = setTimeout(() => setIsVisible(true), 3000)
    const cycleTimer = setInterval(() => {
      setMessage(prev => {
        const idx = INSIGHTS.indexOf(prev)
        return INSIGHTS[(idx + 1) % INSIGHTS.length]
      })
    }, 8000)
    return () => { clearTimeout(showTimer); clearInterval(cycleTimer) }
  }, [])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="fixed bottom-4 left-4 z-40 flex items-center gap-2.5 px-3.5 py-2 rounded-full border border-brand/20 bg-black/60 backdrop-blur-xl shadow-lg shadow-brand/5"
        >
          <div className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand" />
          </div>
          <Bot className="w-3.5 h-3.5 text-brand" />
          <span className="text-[11px] font-medium text-white/40 tracking-wide">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
