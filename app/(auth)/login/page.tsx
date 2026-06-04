"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Sparkles, Mail, Lock, Github } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError("Invalid email or password")
      setLoading(false)
    } else {
      router.push(callbackUrl)
      router.refresh()
    }
  }

  return (
    <div className="glass-elevated w-full max-w-md p-8 rounded-[24px]">
      <div className="flex flex-col items-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-brand flex items-center justify-center mb-4">
          <Sparkles className="w-6 h-6 text-black" />
        </div>
        <h1 className="text-2xl font-bold text-text-primary">Welcome back</h1>
        <p className="text-sm text-text-secondary mt-1">Sign in to your LifeOS account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

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

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-all"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-sm text-brand hover:underline">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-xl bg-brand text-black font-semibold text-sm hover:brightness-110 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-3 text-xs text-text-tertiary bg-[var(--surface-card)]">or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
          <button
            onClick={() => signIn("google", { callbackUrl })}
            className="h-11 rounded-xl bg-white/5 border border-white/10 text-text-primary text-sm font-medium hover:bg-white/10 transition-all"
          >
            Google
          </button>
        )}
        {process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID && (
          <button
            onClick={() => signIn("github", { callbackUrl })}
            className="h-11 rounded-xl bg-white/5 border border-white/10 text-text-primary text-sm font-medium hover:bg-white/10 transition-all flex items-center justify-center gap-2"
          >
            <Github className="w-4 h-4" /> GitHub
          </button>
        )}
      </div>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-brand hover:underline font-medium">
          Sign up
        </Link>
      </p>
    </div>
  )
}
