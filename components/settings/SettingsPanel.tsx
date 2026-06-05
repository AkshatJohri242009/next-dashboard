"use client"

import { useState, useEffect } from "react"
import { useJarvisStore } from "@/lib/jarvis-store"
import { DEFAULT_PROVIDERS } from "@/lib/jarvis-types"
import type { LLMProvider } from "@/lib/jarvis-types"
import { Plus, Trash2, Key } from "lucide-react"

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

          {/* API Key input */}
          <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 mb-2">
            <Key size={12} className="text-white/30 flex-shrink-0" />
            <input
              type="password"
              value={apiKeys[activeProvider] || ""}
              onChange={(e) => handleApiKeyChange(activeProvider, e.target.value)}
              placeholder={`API key for ${activeProvider}...`}
              className="flex-1 bg-transparent text-xs text-white outline-none placeholder:text-white/20"
            />
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