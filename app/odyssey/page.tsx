"use client"

import { motion } from "framer-motion"
import { Bot, Sparkles } from "lucide-react"
import dynamic from "next/dynamic"

const JarvisChat = dynamic(() => import("@/components/jarvis/JarvisChat"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[calc(100dvh-200px)]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
        <p className="text-sm text-white/30">Initializing JARVIS...</p>
      </div>
    </div>
  ),
})

export default function JARVISPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-brand/20 flex items-center justify-center">
          <Bot className="w-4 h-4 text-brand" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gradient">J.A.R.V.I.S</h1>
          <p className="text-xs text-text-tertiary">Your AI strategist, coach, and mentor</p>
        </div>
      </div>

      <div className="h-[calc(100dvh-200px)] sm:h-[calc(100dvh-280px)] rounded-2xl overflow-hidden border border-white/[0.06] glass-strong">
        <JarvisChat />
      </div>
    </motion.div>
  )
}
