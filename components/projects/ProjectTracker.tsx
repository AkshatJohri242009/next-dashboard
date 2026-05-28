"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Star, GitFork, ExternalLink, Clock, Play, Square, Search, Bookmark, BookmarkCheck } from "lucide-react"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import type { GitHubRepo } from "@/lib/types"

const GITHUB_USER = "AkshatJohri242009"

function timeFmt(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

export function ProjectTracker() {
  const {
    repos, setRepos,
    featuredRepos, toggleFeatured,
    currentProject, setCurrentProject,
    trackedProjects, startTracking, stopTracking,
  } = useStore()
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [showAll, setShowAll] = useState(false)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (repos.length > 0) return
    setLoading(true)
    fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setRepos(data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [repos.length, setRepos])

  const activeTracked = trackedProjects.find(t => t.startTime)
  const filtered = repos.filter(r => !r.fork)
  const display = showAll ? filtered : (featuredRepos.length > 0 ? filtered.filter(r => featuredRepos.includes(r.name)) : filtered.slice(0, 12))
  const searched = search ? display.filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || (r.description || "").toLowerCase().includes(search.toLowerCase())) : display

  useEffect(() => {
    if (!activeTracked?.startTime) { setElapsed(0); return }
    const id = setInterval(() => setElapsed(Math.round((Date.now() - activeTracked.startTime!) / 60000)), 10000)
    return () => clearInterval(id)
  }, [activeTracked?.startTime])

  const total = activeTracked ? (activeTracked.totalMinutes + elapsed) : 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gradient">Projects</h1>
          <p className="text-sm text-white/40 mt-1">Track time on your GitHub repos.</p>
        </div>
        <button
          onClick={() => setShowAll(!showAll)}
          className="h-10 px-4 rounded-xl bg-white/[0.04] border border-white/[0.06] text-xs font-bold text-white/50 hover:text-white/80 hover:bg-white/[0.08] transition-colors"
        >
          {showAll ? "Show Featured" : "Show All Repos"}
        </button>
      </div>

      {activeTracked && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-2xl p-5 border border-brand-500/20"
        >
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <span className="text-[10px] font-mono font-extrabold tracking-widest text-brand-400/70 uppercase">Tracking</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-lg font-bold text-white/90">{activeTracked.name}</span>
                <span className="text-[28px] font-bold tabular-nums text-brand-400">{timeFmt(total)}</span>
              </div>
            </div>
            <button
              onClick={stopTracking}
              className="h-10 px-5 rounded-xl bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/30 flex items-center gap-2 hover:bg-red-500/30 transition-colors"
            >
              <Square className="w-3.5 h-3.5" />
              Stop
            </button>
          </div>
        </motion.div>
      )}

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search repos..."
          className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-white outline-none placeholder:text-white/30 focus:border-white/20 transition-colors"
        />
      </div>

      {loading && repos.length === 0 && (
        <div className="py-12 text-center text-sm text-white/30 italic">Loading repos...</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {searched.map((repo, i) => {
          const isFeatured = featuredRepos.includes(repo.name)
          const isCurrent = currentProject === repo.name
          const tracked = trackedProjects.find(t => t.name === repo.name)
          return (
            <motion.div
              key={repo.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.3) }}
              className={cn(
                "rounded-xl p-4 border transition-all duration-200 flex flex-col",
                isCurrent ? "border-brand-500/30 bg-brand-500/5" : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]",
              )}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-bold text-white/80 hover:text-brand-400 transition-colors truncate flex items-center gap-1.5"
                >
                  {repo.name}
                  <ExternalLink className="w-3 h-3 shrink-0 opacity-40" />
                </a>
                <button
                  onClick={() => toggleFeatured(repo.name)}
                  className="shrink-0 text-white/30 hover:text-amber-400 transition-colors"
                >
                  {isFeatured ? <BookmarkCheck className="w-4 h-4 text-amber-400" /> : <Bookmark className="w-4 h-4" />}
                </button>
              </div>

              {repo.description && (
                <p className="text-xs text-white/40 mb-3 line-clamp-2">{repo.description}</p>
              )}

              <div className="flex items-center gap-3 text-[11px] text-white/30 font-mono mb-3">
                {repo.language && (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-brand-400" />
                    {repo.language}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  {repo.stargazers_count}
                </span>
                <span className="flex items-center gap-1">
                  <GitFork className="w-3 h-3" />
                  {repo.forks_count}
                </span>
              </div>

              {tracked && tracked.totalMinutes > 0 && (
                <div className="text-[10px] font-mono text-white/30 mb-2 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {timeFmt(tracked.totalMinutes)} total
                </div>
              )}

              <div className="mt-auto flex gap-1.5">
                <button
                  onClick={() => setCurrentProject(repo.name)}
                  className={cn(
                    "flex-1 h-9 rounded-xl text-xs font-bold transition-colors",
                    isCurrent
                      ? "bg-brand-500/20 text-brand-300 border border-brand-500/30"
                      : "bg-white/[0.04] text-white/40 border border-white/[0.06] hover:text-white/70 hover:bg-white/[0.08]",
                  )}
                >
                  {isCurrent ? "Selected" : "Select"}
                </button>
                {isCurrent && !activeTracked && (
                  <button
                    onClick={startTracking}
                    className="h-9 w-9 rounded-xl bg-brand-500 text-black flex items-center justify-center hover:bg-brand-400 transition-colors"
                  >
                    <Play className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {!loading && searched.length === 0 && (
        <div className="py-12 text-center text-sm text-white/30 italic">
          {search ? "No repos match your search." : showAll ? "No repos found." : "No featured repos. Bookmark some repos above or click 'Show All Repos'."}
        </div>
      )}
    </div>
  )
}
