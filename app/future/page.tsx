"use client"

import { FutureSelfPanel } from "@/components/jarvis/FutureSelfPanel"
import { JarvisInsightBar } from "@/components/life/JarvisInsightBar"
import { TrendingUp } from "lucide-react"

export default function FuturePage() {
  return (
    <div className="space-y-6 relative">
      <div className="fixed top-1/2 right-[-180px] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-brand/15 to-accent/5 blur-[120px] opacity-20 pointer-events-none animate-breathing" />
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-400 to-accent-500 flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gradient">Future Self Engine</h1>
          <p className="text-sm text-white/40">Trajectory projections — see where your habits are taking you</p>
        </div>
      </div>
      <JarvisInsightBar />
      <div className="glass-strong rounded-2xl border border-white/[0.08] p-4 sm:p-6">
        <FutureSelfPanel />
      </div>
    </div>
  )
}
