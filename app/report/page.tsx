"use client"

import { LifeReportCard } from "@/components/jarvis/LifeReportCard"
import { JarvisInsightBar } from "@/components/life/JarvisInsightBar"
import { Trophy } from "lucide-react"

export default function ReportPage() {
  return (
    <div className="space-y-6 relative">

      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-xl bg-brand/20 flex items-center justify-center">
          <Trophy className="w-4 h-4 text-brand" />
        </div>
        <div>
          <h1 className="page-title">Annual Life Report</h1>
          <p className="text-sm text-text-tertiary">Your year in review — goals, habits, fitness, and growth</p>
        </div>
      </div>
      <JarvisInsightBar />
      <div className="glass-strong rounded-2xl border border-white/[0.08] p-4 sm:p-6">
        <LifeReportCard />
      </div>
    </div>
  )
}
