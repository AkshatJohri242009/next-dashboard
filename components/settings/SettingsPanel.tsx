"use client"

import { useJarvisStore } from "@/lib/jarvis-store"

export function SettingsPanel({ onClose }: { onClose?: () => void }) {
  const { model, setModel, systemPrompt, setSystemPrompt, mode, setMode, endpointUrl, setEndpointUrl } = useJarvisStore()

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-white/10 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white/80">Settings</h2>
        {onClose && (
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-white/40">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <label className="text-xs text-white/50 mb-1 block">Model</label>
          <input
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full bg-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none placeholder:text-white/30"
            placeholder="gpt-4o"
          />
        </div>
        <div>
          <label className="text-xs text-white/50 mb-1 block">API Endpoint</label>
          <input
            value={endpointUrl}
            onChange={(e) => setEndpointUrl(e.target.value)}
            className="w-full bg-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none placeholder:text-white/30"
            placeholder="https://api.openai.com/v1"
          />
        </div>
        <div>
          <label className="text-xs text-white/50 mb-1 block">Mode</label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as "chat" | "agent" | "research")}
            className="w-full bg-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none"
          >
            <option value="chat">Chat</option>
            <option value="agent">Agent</option>
            <option value="research">Research</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-white/50 mb-1 block">System Prompt</label>
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            rows={6}
            className="w-full bg-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none placeholder:text-white/30 resize-none"
          />
        </div>
      </div>
    </div>
  )
}
