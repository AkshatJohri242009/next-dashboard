"use client"

import { SettingsPanel } from "@/components/settings/SettingsPanel"
import { JarvisInsightBar } from "@/components/life/JarvisInsightBar"
import { Settings, Palette } from "lucide-react"
import { ThemeModeToggle, ThemePresetGrid } from "@/components/layout/ThemePresetGrid"

function ThemeSettingsSection() {
  return (
    <div className="glass-strong rounded-2xl border border-white/[0.08] p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Palette className="w-4 h-4 text-text-tertiary" />
        <span className="section-label">Theme</span>
      </div>
      <div className="mb-4">
        <span className="text-xs text-text-tertiary mb-2 block">Mode</span>
        <ThemeModeToggle />
      </div>
      <div>
        <span className="text-xs text-text-tertiary mb-3 block">Presets</span>
        <ThemePresetGrid />
      </div>
    </div>
  )
}

export default function SettingsPageClient() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-xl bg-brand/20 flex items-center justify-center">
          <Settings className="w-4 h-4 text-brand" />
        </div>
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="text-sm text-text-tertiary">JARVIS configuration & preferences</p>
        </div>
      </div>
      <JarvisInsightBar />
      <ThemeSettingsSection />
      <div className="glass-strong rounded-2xl border border-white/[0.08] p-4 sm:p-6">
        <div className="max-w-lg">
          <SettingsPanel />
        </div>
      </div>
    </div>
  )
}
