"use client"

import { CorrelationPanel } from "@/components/jarvis/CorrelationPanel"
import { JarvisInsightBar } from "@/components/life/JarvisInsightBar"
import { Activity } from "lucide-react"

export default function CorrelationsPage() {
  return (
    <div className="space-y-6 relative">

      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-xl bg-brand/20 flex items-center justify-center">
          <Activity className="w-4 h-4 text-brand" />
        </div>
        <div>
          <h1 className="page-title">Correlation Engine</h1>
          <p className="text-sm text-text-tertiary">Discover patterns that connect your sleep, gym, mood, and productivity</p>
        </div>
      </div>
      <JarvisInsightBar />
      <div className="glass-strong rounded-2xl border border-white/[0.08] p-4 sm:p-6">
        <CorrelationPanel />
      </div>
    </div>
  )
}
