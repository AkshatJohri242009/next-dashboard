"use client"

import { VoiceBriefingPanel } from "@/components/jarvis/VoiceBriefingPanel"
import { JarvisInsightBar } from "@/components/life/JarvisInsightBar"
import { Sparkles } from "lucide-react"

export default function BriefingsPageClient() {
  return (
    <div className="space-y-6 relative">

      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-400 to-accent-500 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gradient">Briefings</h1>
          <p className="text-sm text-text-tertiary">Daily, weekly, and monthly intelligence briefings</p>
        </div>
      </div>
      <JarvisInsightBar />
      <div className="glass-strong rounded-2xl border border-white/[0.08] p-4 sm:p-6">
        <VoiceBriefingPanel />
      </div>
    </div>
  )
}
