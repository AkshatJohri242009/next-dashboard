"use client"

import { VoiceButton } from "@/components/jarvis/VoiceButton"
import { VoiceBriefingPanel } from "@/components/jarvis/VoiceBriefingPanel"
import { VoiceJournalModal } from "@/components/jarvis/VoiceJournalModal"
import { JarvisInsightBar } from "@/components/life/JarvisInsightBar"
import { Sparkles } from "lucide-react"

export default function VoicePage() {
  return (
    <div className="space-y-6 relative">
      <div className="fixed top-1/4 right-[-200px] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-brand/10 to-accent/5 blur-[120px] opacity-20 pointer-events-none animate-breathing" />
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-400 to-accent-500 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gradient">JARVIS Voice</h1>
          <p className="text-sm text-white/40">Speak naturally. JARVIS listens.</p>
        </div>
      </div>

      <JarvisInsightBar />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="glass-strong rounded-2xl border border-white/[0.08] p-4 sm:p-6">
            <h2 className="text-sm font-semibold text-white/70 mb-3">Quick Commands</h2>
            <div className="grid grid-cols-2 gap-2">
              {[
                { action: "Morning Briefing", desc: "Start your day informed" },
                { action: "Evening Review", desc: "Reflect on your day" },
                { action: "Voice Journal", desc: "Speak your thoughts" },
                { action: "Weekly Review", desc: "Get the big picture" },
                { action: "Add a Goal", desc: "Quick goal entry" },
                { action: "Log Workout", desc: "Track your session" },
              ].map((cmd) => (
                <div key={cmd.action} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-colors cursor-pointer">
                  <p className="text-xs font-medium text-white/70">{cmd.action}</p>
                  <p className="text-[10px] text-white/30 mt-0.5">{cmd.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-strong rounded-2xl border border-white/[0.08] p-4 sm:p-6">
            <VoiceJournalModal />
          </div>
        </div>
        <div className="glass-strong rounded-2xl border border-white/[0.08] p-4 sm:p-6">
          <h2 className="text-sm font-semibold text-white/70 mb-3">Briefings</h2>
          <VoiceBriefingPanel />
        </div>
      </div>
      <VoiceButton />
    </div>
  )
}
