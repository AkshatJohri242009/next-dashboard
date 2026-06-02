"use client"

import { CorrelationPanel } from "@/components/jarvis/CorrelationPanel"
import { JarvisInsightBar } from "@/components/life/JarvisInsightBar"
import { Activity } from "lucide-react"

export default function CorrelationsPage() {
  return (
    <div className="space-y-6 relative">
      <div className="fixed top-1/3 left-[-100px] w-[400px] h-[400px] rounded-full bg-gradient-to-br from-warning/10 to-accent/5 blur-[100px] opacity-20 pointer-events-none animate-breathing" />
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-400 to-accent-500 flex items-center justify-center">
          <Activity className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gradient">Correlation Engine</h1>
          <p className="text-sm text-white/40">Discover patterns that connect your sleep, gym, mood, and productivity</p>
        </div>
      </div>
      <JarvisInsightBar />
      <div className="glass-strong rounded-2xl border border-white/[0.08] p-4 sm:p-6">
        <CorrelationPanel />
      </div>
    </div>
  )
}
