"use client"

import { Pause, Play, Square } from "lucide-react"

interface JarvisVoicePlaybackBarProps {
  speaking: boolean
  paused: boolean
  onPause: () => void
  onResume: () => void
  onStop: () => void
}

export default function JarvisVoicePlaybackBar({
  speaking,
  paused,
  onPause,
  onResume,
  onStop,
}: JarvisVoicePlaybackBarProps) {
  if (!speaking) return null

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 glass-strong rounded-2xl px-4 py-3 shadow-elevated-lg flex items-center gap-3 animate-slide-up">
      <div className="flex items-center gap-1.5 mr-1">
        <span className="w-1 h-3 rounded-full bg-brand animate-pulse" style={{ animationDelay: "0ms" }} />
        <span className="w-1 h-4 rounded-full bg-brand animate-pulse" style={{ animationDelay: "200ms" }} />
        <span className="w-1 h-2 rounded-full bg-brand animate-pulse" style={{ animationDelay: "400ms" }} />
        <span className="w-1 h-4 rounded-full bg-brand animate-pulse" style={{ animationDelay: "100ms" }} />
        <span className="w-1 h-3 rounded-full bg-brand animate-pulse" style={{ animationDelay: "300ms" }} />
      </div>
      <span className="text-xs text-text-secondary font-medium">J.A.R.V.I.S. speaking</span>
      <div className="w-px h-4 bg-white/10 mx-1" />
      <button
        onClick={paused ? onResume : onPause}
        className="p-1.5 rounded-lg hover:bg-white/10 text-text-secondary hover:text-white transition-colors"
        title={paused ? "Resume" : "Pause"}
      >
        {paused ? <Play size={14} /> : <Pause size={14} />}
      </button>
      <button
        onClick={onStop}
        className="p-1.5 rounded-lg hover:bg-white/10 text-text-tertiary hover:text-red-400 transition-colors"
        title="Stop"
      >
        <Square size={14} />
      </button>
    </div>
  )
}
