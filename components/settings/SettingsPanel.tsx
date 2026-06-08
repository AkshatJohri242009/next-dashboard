"use client"

import { useState, useEffect } from "react"
import { useJarvisStore } from "@/lib/jarvis-store"
import { DEFAULT_PROVIDERS } from "@/lib/jarvis-types"
import type { LLMProvider } from "@/lib/jarvis-types"
import { Plus, Trash2, Key, Play, Volume2 } from "lucide-react"

export function SettingsPanel({ onClose }: { onClose?: () => void }) {
  const { model, setModel, systemPrompt, setSystemPrompt, mode, setMode, endpointUrl, setEndpointUrl, providers, setProviders } = useJarvisStore()

  const [activeProvider, setActiveProvider] = useState<string>(() => {
    const matched = DEFAULT_PROVIDERS.find(p => p.models.includes(model) || p.base_url === endpointUrl)
    return matched?.name || DEFAULT_PROVIDERS[4]?.name || "Groq"
  })

  const [apiKeys, setApiKeys] = useState<Record<string, string>>(() => {
    try { return JSON.parse(localStorage.getItem("jarvis_api_keys") || "{}") }
    catch { return {} }
  })

  useEffect(() => {
    localStorage.setItem("jarvis_api_keys", JSON.stringify(apiKeys))
  }, [apiKeys])

  // ---- Voice settings ----
  const [voiceAutoRead, setVoiceAutoRead] = useState(() => localStorage.getItem("lifeos-jarvis-autoread") === "true")
  const [voiceAutoSend, setVoiceAutoSend] = useState(() => localStorage.getItem("lifeos-jarvis-autosend") === "true")
  const [voiceContinuous, setVoiceContinuous] = useState(() => localStorage.getItem("lifeos-jarvis-continuous") === "true")
  const [voiceLang, setVoiceLang] = useState(() => localStorage.getItem("lifeos-jarvis-lang") || "en-US")
  const [voiceName, setVoiceName] = useState(() => localStorage.getItem("lifeos-jarvis-voice") || "")
  const [voiceRate, setVoiceRate] = useState(() => parseFloat(localStorage.getItem("lifeos-jarvis-rate") || "1.0"))
  const [voicePitch, setVoicePitch] = useState(() => parseFloat(localStorage.getItem("lifeos-jarvis-pitch") || "1.0"))
  const [voiceVolume, setVoiceVolume] = useState(() => parseFloat(localStorage.getItem("lifeos-jarvis-volume") || "0.9"))
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [voiceSearch, setVoiceSearch] = useState("")

  useEffect(() => { localStorage.setItem("lifeos-jarvis-autoread", voiceAutoRead ? "true" : "false") }, [voiceAutoRead])
  useEffect(() => { localStorage.setItem("lifeos-jarvis-autosend", voiceAutoSend ? "true" : "false") }, [voiceAutoSend])
  useEffect(() => { localStorage.setItem("lifeos-jarvis-continuous", voiceContinuous ? "true" : "false") }, [voiceContinuous])
  useEffect(() => { localStorage.setItem("lifeos-jarvis-lang", voiceLang) }, [voiceLang])
  useEffect(() => { localStorage.setItem("lifeos-jarvis-voice", voiceName) }, [voiceName])
  useEffect(() => { localStorage.setItem("lifeos-jarvis-rate", String(voiceRate)) }, [voiceRate])
  useEffect(() => { localStorage.setItem("lifeos-jarvis-pitch", String(voicePitch)) }, [voicePitch])
  useEffect(() => { localStorage.setItem("lifeos-jarvis-volume", String(voiceVolume)) }, [voiceVolume])

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const loadVoices = () => setVoices(window.speechSynthesis.getVoices())
      loadVoices()
      window.speechSynthesis.onvoiceschanged = loadVoices
    }
  }, [])

  const testVoice = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance("Hello, I am J.A.R.V.I.S., your personal AI assistant.")
    u.rate = voiceRate
    u.pitch = voicePitch
    u.volume = voiceVolume
    if (voiceName) {
      const match = voices.find(v => v.name === voiceName)
      if (match) u.voice = match
    }
    window.speechSynthesis.speak(u)
  }

  const RECOGNITION_LANGS = [
    { value: "en-US", label: "English (US)" },
    { value: "en-GB", label: "English (UK)" },
    { value: "hi-IN", label: "Hindi (India)" },
    { value: "es-ES", label: "Spanish (Spain)" },
    { value: "fr-FR", label: "French (France)" },
    { value: "de-DE", label: "German (Germany)" },
    { value: "ja-JP", label: "Japanese (Japan)" },
    { value: "zh-CN", label: "Chinese (Simplified)" },
  ]

  const RECOMMENDED_VOICES = ["Google UK English Male", "Google UK English Female", "Microsoft Guy Online", "Microsoft Aria Online", "Daniel", "Samantha"]

  const filteredVoices = voiceSearch
    ? voices.filter(v => v.name.toLowerCase().includes(voiceSearch.toLowerCase()) || v.lang.toLowerCase().includes(voiceSearch.toLowerCase()))
    : voices

  const allProviders = [...DEFAULT_PROVIDERS, ...providers.filter(p => !DEFAULT_PROVIDERS.some(d => d.name === p.name))]

  const currentProvider = allProviders.find(p => p.name === activeProvider) || allProviders[0]

  const handleSelectProvider = (name: string) => {
    setActiveProvider(name)
    const prov = allProviders.find(p => p.name === name)
    if (prov) {
      setEndpointUrl(prov.base_url)
      if (prov.models.length > 0) {
        setModel(prov.models[0])
      }
    }
  }

  const handleSelectModel = (m: string) => {
    setModel(m)
  }

  const handleApiKeyChange = (name: string, key: string) => {
    setApiKeys(prev => ({ ...prev, [name]: key }))
  }

  // API key validation
  const [keyValidating, setKeyValidating] = useState<string | null>(null)
  const [keyStatus, setKeyStatus] = useState<Record<string, "valid" | "invalid" | "untested">>(() => {
    try { return JSON.parse(localStorage.getItem("lifeos-jarvis-key-status") || "{}") }
    catch { return {} }
  })

  useEffect(() => { localStorage.setItem("lifeos-jarvis-key-status", JSON.stringify(keyStatus)) }, [keyStatus])

  const validateKey = async (name: string) => {
    const key = apiKeys[name]
    if (!key) return
    setKeyValidating(name)
    try {
      const provider = allProviders.find(p => p.name === name)
      const baseUrl = provider?.base_url || "https://api.groq.com/openai/v1"
      const res = await fetch("/api/jarvis/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: "test", message: "ping", apiKey: key, endpointUrl: baseUrl, model: provider?.models?.[0] || "llama-3.3-70b-versatile", regenerate: true }),
        signal: AbortSignal.timeout(10000),
      })
      setKeyStatus(prev => ({ ...prev, [name]: res.ok ? "valid" : "invalid" }))
    } catch {
      setKeyStatus(prev => ({ ...prev, [name]: "invalid" }))
    }
    setKeyValidating(null)
  }

  const addCustomProvider = () => {
    const newProv: LLMProvider = {
      name: `Custom ${providers.length + 1}`,
      base_url: "https://api.openai.com/v1",
      models: [],
    }
    setProviders([...providers, newProv])
    setActiveProvider(newProv.name)
  }

  const removeCustomProvider = (name: string) => {
    setProviders(providers.filter(p => p.name !== name))
    if (activeProvider === name) {
      setActiveProvider(DEFAULT_PROVIDERS[0]?.name || "Groq")
    }
  }

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
        {/* Provider selector */}
        <div>
          <label className="text-xs text-white/50 mb-1 block">Provider</label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {allProviders.map(p => (
              <button
                key={p.name}
                onClick={() => handleSelectProvider(p.name)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  activeProvider === p.name
                    ? "bg-brand/20 text-brand border border-brand/30"
                    : "bg-white/10 text-white/60 hover:text-white/80 border border-transparent"
                }`}
              >
                {p.name}
              </button>
            ))}
            <button
              onClick={addCustomProvider}
              className="px-2 py-1 rounded-lg text-xs text-white/40 hover:text-white/60 bg-white/5 hover:bg-white/10 transition-colors"
            >
              <Plus size={12} />
            </button>
          </div>

          {/* API Key input with validation */}
          <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 mb-2">
            <Key size={12} className="text-white/30 flex-shrink-0" />
            <input
              type="password"
              value={apiKeys[activeProvider] || ""}
              onChange={(e) => handleApiKeyChange(activeProvider, e.target.value)}
              placeholder={`API key for ${activeProvider}...`}
              className="flex-1 bg-transparent text-xs text-white outline-none placeholder:text-white/20"
            />
            {keyValidating === activeProvider ? (
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse flex-shrink-0" title="Testing..." />
            ) : keyStatus[activeProvider] === "valid" ? (
              <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" title="Connected" />
            ) : keyStatus[activeProvider] === "invalid" ? (
              <span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" title="Invalid key" />
            ) : null}
            <button
              onClick={() => validateKey(activeProvider)}
              disabled={!apiKeys[activeProvider] || keyValidating === activeProvider}
              className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-white/60 disabled:opacity-30 flex-shrink-0"
              title="Test connection"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
            </button>
          </div>
        </div>

        {/* Model selector */}
        {currentProvider.models.length > 0 && (
          <div>
            <label className="text-xs text-white/50 mb-1 block">Model</label>
            <div className="flex flex-wrap gap-1.5">
              {currentProvider.models.map(m => (
                <button
                  key={m}
                  onClick={() => handleSelectModel(m)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    model === m
                      ? "bg-accent/20 text-accent border border-accent/30"
                      : "bg-white/10 text-white/60 hover:text-white/80 border border-transparent"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Custom model input */}
        <div>
          <label className="text-xs text-white/50 mb-1 block">Custom Model</label>
          <input
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full bg-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none placeholder:text-white/30"
            placeholder="llama-3.3-70b-versatile"
          />
        </div>

        {/* API Endpoint */}
        <div>
          <label className="text-xs text-white/50 mb-1 block">API Endpoint</label>
          <input
            value={endpointUrl}
            onChange={(e) => setEndpointUrl(e.target.value)}
            className="w-full bg-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none placeholder:text-white/30"
            placeholder="https://api.groq.com/openai/v1"
          />
        </div>

        {/* Mode */}
        <div>
          <label className="text-xs text-white/50 mb-1 block">Mode</label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as "chat" | "agent" | "research")}
            className="w-full bg-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none"
          >
            <option value="chat">Chat</option>
            <option value="agent">Agent (tool calling)</option>
            <option value="research">Research</option>
          </select>
        </div>

        {/* System Prompt */}
        <div>
          <label className="text-xs text-white/50 mb-1 block">System Prompt</label>
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            rows={6}
            className="w-full bg-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none placeholder:text-white/30 resize-none"
          />
          <div className="flex justify-between mt-1 items-center">
            <span className="text-[9px] text-white/30">{systemPrompt.length} chars · ~{Math.ceil(systemPrompt.length / 4)} tokens</span>
            <button
              onClick={() => setSystemPrompt("You are J.A.R.V.I.S., an AI assistant.")}
              className="text-[9px] text-white/20 hover:text-white/50 transition-colors"
            >Reset to default</button>
          </div>
        </div>

        {/* Voice Settings */}
        <div className="border-t border-white/10 pt-4 mt-4">
          <div className="flex items-center gap-2 mb-3">
            <Volume2 size={14} className="text-brand" />
            <label className="text-xs font-semibold text-white/70">Voice</label>
          </div>

          {/* Toggles */}
          <div className="space-y-2 mb-3">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs text-white/60">Auto-read responses</span>
              <input type="checkbox" checked={voiceAutoRead} onChange={e => setVoiceAutoRead(e.target.checked)} className="accent-brand" />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs text-white/60">Auto-send voice after pause</span>
              <input type="checkbox" checked={voiceAutoSend} onChange={e => setVoiceAutoSend(e.target.checked)} className="accent-brand" />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs text-white/60">Continuous listening mode</span>
              <input type="checkbox" checked={voiceContinuous} onChange={e => setVoiceContinuous(e.target.checked)} className="accent-brand" />
            </label>
          </div>

          {/* Recognition language */}
          <div className="mb-3">
            <label className="text-xs text-white/50 mb-1 block">Recognition language</label>
            <select value={voiceLang} onChange={e => setVoiceLang(e.target.value)}
              className="w-full bg-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none">
              {RECOGNITION_LANGS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>

          {/* Voice selector */}
          <div className="mb-3">
            <label className="text-xs text-white/50 mb-1 block">Voice</label>
            <input value={voiceSearch} onChange={e => setVoiceSearch(e.target.value)}
              placeholder="Search voices..." className="w-full bg-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none mb-1 placeholder:text-white/20" />
            <div className="max-h-32 overflow-y-auto bg-white/5 rounded-lg space-y-0.5 p-1">
              {filteredVoices.length === 0 && <p className="text-[10px] text-white/30 text-center py-2">No voices found</p>}
              {filteredVoices.map(v => {
                const isRecommended = RECOMMENDED_VOICES.includes(v.name)
                return (
                  <button key={v.name}
                    onClick={() => { setVoiceName(v.name); setVoiceSearch("") }}
                    className={`w-full text-left px-2 py-1.5 rounded text-[11px] transition-colors flex items-center gap-2 ${
                      voiceName === v.name ? "bg-brand/20 text-brand" : "text-white/60 hover:bg-white/10"
                    }`}
                  >
                    <span className="flex-1 truncate">{isRecommended && "★ "}{v.name}</span>
                    <span className="text-[9px] text-white/30">{v.lang}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Sliders */}
          <div className="space-y-2 mb-3">
            <div>
              <label className="text-[10px] text-white/50 flex justify-between">Rate <span className="text-white/40">{voiceRate.toFixed(1)}x</span></label>
              <input type="range" min="0.5" max="2" step="0.1" value={voiceRate} onChange={e => setVoiceRate(parseFloat(e.target.value))}
                className="w-full accent-brand h-1.5 rounded-full appearance-none bg-white/10 cursor-pointer" />
            </div>
            <div>
              <label className="text-[10px] text-white/50 flex justify-between">Pitch <span className="text-white/40">{voicePitch.toFixed(1)}</span></label>
              <input type="range" min="0.5" max="2" step="0.1" value={voicePitch} onChange={e => setVoicePitch(parseFloat(e.target.value))}
                className="w-full accent-brand h-1.5 rounded-full appearance-none bg-white/10 cursor-pointer" />
            </div>
            <div>
              <label className="text-[10px] text-white/50 flex justify-between">Volume <span className="text-white/40">{voiceVolume.toFixed(1)}</span></label>
              <input type="range" min="0" max="1" step="0.05" value={voiceVolume} onChange={e => setVoiceVolume(parseFloat(e.target.value))}
                className="w-full accent-brand h-1.5 rounded-full appearance-none bg-white/10 cursor-pointer" />
            </div>
          </div>

          {/* Test button */}
          <button onClick={testVoice}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-brand/20 hover:bg-brand/30 text-brand text-xs font-medium transition-colors">
            <Play size={12} />
            Test Voice
          </button>
        </div>

        {/* Custom providers list */}
        {providers.length > 0 && (
          <div>
            <label className="text-xs text-white/50 mb-1 block">Custom Providers</label>
            {providers.map(p => (
              <div key={p.name} className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 mb-1">
                <span className="text-xs text-white/60 flex-1">{p.name}</span>
                <input
                  value={p.base_url}
                  onChange={(e) => {
                    setProviders(providers.map(pr => pr.name === p.name ? { ...pr, base_url: e.target.value } : pr))
                  }}
                  className="flex-1 bg-transparent text-xs text-white outline-none"
                  placeholder="Base URL"
                />
                <button
                  onClick={() => removeCustomProvider(p.name)}
                  className="p-1 rounded hover:bg-red-500/20 text-white/30 hover:text-red-400"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}