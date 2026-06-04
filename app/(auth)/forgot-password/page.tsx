"use client"

import { useState } from "react"
import Link from "next/link"
import { Sparkles, Mail, ArrowLeft } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // In production, this would call an API to send a reset email
    await new Promise(r => setTimeout(r, 1000))
    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="glass-elevated w-full max-w-md p-8 rounded-[24px] text-center">
        <div className="w-12 h-12 rounded-2xl bg-brand/20 flex items-center justify-center mx-auto mb-4">
          <Mail className="w-6 h-6 text-brand" />
        </div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">Check your email</h1>
        <p className="text-text-secondary text-sm mb-6">
          We sent a password reset link to <strong className="text-text-primary">{email}</strong>
        </p>
        <Link href="/login" className="text-brand hover:underline text-sm">
          Back to login
        </Link>
      </div>
    )
  }

  return (
    <div className="glass-elevated w-full max-w-md p-8 rounded-[24px]">
      <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to login
      </Link>

      <div className="flex flex-col items-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-brand flex items-center justify-center mb-4">
          <Sparkles className="w-6 h-6 text-black" />
        </div>
        <h1 className="text-2xl font-bold text-text-primary">Reset password</h1>
        <p className="text-sm text-text-secondary mt-1 text-center">
          Enter your email and we&apos;ll send you a recovery link
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-xl bg-brand text-black font-semibold text-sm hover:brightness-110 disabled:opacity-50 transition-all"
        >
          {loading ? "Sending..." : "Send reset link"}
        </button>
      </form>
    </div>
  )
}
