"use client"

import { useState } from "react"

export default function JarvisSetup() {
  const [step, setStep] = useState<"welcome" | "running" | "done" | "error">("welcome")
  const [errorMsg, setErrorMsg] = useState("")
  const [serviceKey, setServiceKey] = useState("")

  const runSetup = async () => {
    setStep("running")
    setErrorMsg("")

    try {
      // Step 1: Create tables via setup API
      const res = await fetch("/api/jarvis/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceRoleKey: serviceKey }),
      })
      const data = await res.json()

      if (!res.ok) {
        if (data.needsManualSetup) {
          // Tables don't exist - save the key and show SQL instructions
          localStorage.setItem("jarvis_service_key", serviceKey)
          setErrorMsg(data.instructions + "\n\n" + data.sql)
          setStep("error")
          return
        }
        setErrorMsg(data.error || "Setup failed")
        setStep("error")
        return
      }

      // Step 2: Save service key to .env.local-equivalent
      localStorage.setItem("jarvis_service_key", serviceKey)
      setStep("done")
    } catch (err: any) {
      setErrorMsg(err.message)
      setStep("error")
    }
  }

  if (step === "done") {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="glass rounded-2xl p-8 max-w-md text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-brand/20 flex items-center justify-center mx-auto">
            <span className="text-3xl">✓</span>
          </div>
          <h2 className="text-xl font-bold text-white">JARVIS is Ready!</h2>
          <p className="text-sm text-white/60">Tables created. Go to the JARVIS tab to sign in and start chatting.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex items-center justify-center p-4">
      <div className="glass rounded-2xl p-8 max-w-lg w-full space-y-6">
        <div className="text-center">
          <h1 className="text-xl font-bold text-white mb-2">J.A.R.V.I.S Setup</h1>
          <p className="text-sm text-white/50">
            One-time setup to create the JARVIS database tables in Supabase.
          </p>
        </div>

        <div className="bg-white/[0.03] rounded-xl p-4 space-y-3">
          <p className="text-xs text-white/60">
            <strong className="text-white/80">Step 1:</strong> Go to{" "}
            <a
              href="https://supabase.com/dashboard/project/kwpfxhxcxsxlkubycxcu/settings/api"
              target="_blank"
              className="text-accent underline"
            >
              Supabase API Settings
            </a>
          </p>
          <p className="text-xs text-white/60">
            <strong className="text-white/80">Step 2:</strong> Find <code className="bg-white/10 px-1 rounded text-accent">service_role key</code> in the &ldquo;Project API keys&rdquo; section.
          </p>
          <p className="text-xs text-white/60">
            <strong className="text-white/80">Step 3:</strong> Copy it and paste below:
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <p className="text-xs text-red-400 whitespace-pre-wrap font-mono">{errorMsg}</p>
          </div>
        )}

        <input
          value={serviceKey}
          onChange={(e) => setServiceKey(e.target.value)}
          placeholder="Paste your service_role key here..."
          className="w-full bg-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none placeholder:text-white/30"
        />

        <button
          onClick={runSetup}
          disabled={!serviceKey || step === "running"}
          className="w-full py-3 rounded-xl bg-accent/20 hover:bg-accent/30 text-accent text-sm font-medium transition-colors disabled:opacity-30"
        >
          {step === "running" ? "Setting up..." : "Run Setup"}
        </button>
      </div>
    </div>
  )
}
