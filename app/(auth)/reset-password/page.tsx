"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Sparkles, Lock } from "lucide-react"

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (password !== confirm) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      setLoading(false)
      return
    }

    // In production, this would verify the token and update the password
    await new Promise(r => setTimeout(r, 1000))
    router.push("/login?reset=true")
  }

  if (!token) {
    return (
      <div className="glass-elevated w-full max-w-md p-8 rounded-[24px] text-center">
        <h1 className="text-xl font-bold text-text-primary mb-2">Invalid link</h1>
        <p className="text-text-secondary text-sm mb-6">This reset link is invalid or expired.</p>
        <Link href="/forgot-password" className="text-brand hover:underline text-sm">
          Request a new link
        </Link>
      </div>
    )
  }

  return (
    <div className="glass-elevated w-full max-w-md p-8 rounded-[24px]">
      <div className="flex flex-col items-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-brand flex items-center justify-center mb-4">
          <Sparkles className="w-6 h-6 text-black" />
        </div>
        <h1 className="text-2xl font-bold text-text-primary">Set new password</h1>
        <p className="text-sm text-text-secondary mt-1">Must be at least 8 characters</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">New password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              required
              minLength={8}
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Confirm password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Repeat password"
              required
              minLength={8}
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-xl bg-brand text-black font-semibold text-sm hover:brightness-110 disabled:opacity-50 transition-all"
        >
          {loading ? "Resetting..." : "Reset password"}
        </button>
      </form>
    </div>
  )
}
