"use client"

import { SettingsPanel } from "@/components/settings/SettingsPanel"
import { JarvisInsightBar } from "@/components/life/JarvisInsightBar"
import { Settings } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-400 to-accent-500 flex items-center justify-center">
          <Settings className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gradient">Settings</h1>
          <p className="text-sm text-white/40">JARVIS configuration & preferences</p>
        </div>
      </div>
      <JarvisInsightBar />
      <div className="glass-strong rounded-2xl border border-white/[0.08] p-4 sm:p-6">
        <div className="max-w-lg">
          <SettingsPanel />
        </div>
      </div>
    </div>
  )
}
