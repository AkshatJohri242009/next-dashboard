"use client"

import { motion } from "framer-motion"
import { Bot } from "lucide-react"
import { useEffect, useState } from "react"

export default function OdysseusPage() {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const odysseyUrl = process.env.NEXT_PUBLIC_ODYSSEY_URL || "http://127.0.0.1:7000"

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-[#e06c75]/20 border border-[#e06c75]/30 flex items-center justify-center">
          <Bot className="w-4 h-4 text-[#e06c75]" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">Odysseus</h1>
          <p className="text-sm text-white/40">AI workspace assistant</p>
        </div>
      </div>

      <div className="relative w-full overflow-hidden rounded-2xl border border-white/[0.06]"
        style={{ height: "calc(100vh - 200px)", minHeight: "500px" }}>
        {!loaded && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#050506] z-10">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-[#e06c75]/30 border-t-[#e06c75] rounded-full animate-spin" />
              <span className="text-sm text-white/30 font-mono">Connecting to Odysseus...</span>
            </div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#050506] z-10">
            <div className="text-center space-y-3 max-w-md px-6">
              <Bot className="w-10 h-10 text-white/20 mx-auto" />
              <p className="text-sm text-white/50">Could not connect to Odysseus</p>
              <p className="text-xs text-white/20 font-mono">
                Make sure Odysseus is running at <span className="text-white/40">{odysseyUrl}</span>
              </p>
              <button
                onClick={() => { setError(false); setLoaded(false) }}
                className="px-4 py-2 rounded-xl bg-white/[0.06] text-white/60 text-xs font-bold hover:bg-white/[0.1] transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}
        <iframe
          src={odysseyUrl}
          className="w-full h-full border-0"
          title="Odysseus AI Workspace"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          allow="clipboard-read; clipboard-write"
        />
      </div>

      <div className="flex items-center gap-2 text-[10px] font-mono text-white/20">
        <div className={`w-1.5 h-1.5 rounded-full ${error ? "bg-red-400" : loaded ? "bg-brand-400" : "bg-white/20"}`} />
        {error ? "Disconnected" : loaded ? "Connected" : "Connecting..."}
        <span className="text-white/10 mx-1">·</span>
        Source: {odysseyUrl}
      </div>
    </motion.div>
  )
}