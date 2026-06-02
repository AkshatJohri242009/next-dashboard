"use client"

import { motion } from "framer-motion"
import { ExternalLink, Github, Sparkles, GitCommit, FolderGit2, RefreshCw } from "lucide-react"
import { useState, useEffect } from "react"

const PROJECTS = [
  { name: "Dashboard", repo: "johriakshat24/next-dashboard", url: "https://github.com/johriakshat24/next-dashboard" },
  { name: "J.A.R.V.I.S", repo: "AkshatJohri242009/jarvis", url: "https://github.com/AkshatJohri242009/jarvis" },
  { name: "OpenCode", repo: "anomalyco/opencode", url: "https://github.com/anomalyco/opencode" },
]

export default function ProjectsPage() {
  const [commits, setCommits] = useState<Record<string, any[]>>({})
  const [loading, setLoading] = useState(true)
  const [releases, setReleases] = useState<Record<string, any[]>>({})

  useEffect(() => {
    async function fetchAll() {
      const results: Record<string, any[]> = {}
      const releaseResults: Record<string, any[]> = {}
      for (const p of PROJECTS) {
        try {
          const [cr, rr] = await Promise.all([
            fetch(`https://api.github.com/repos/${p.repo}/commits?per_page=5`).then(r => r.json()),
            fetch(`https://api.github.com/repos/${p.repo}/releases?per_page=3`).then(r => r.json()),
          ])
          results[p.repo] = Array.isArray(cr) ? cr : []
          releaseResults[p.repo] = Array.isArray(rr) ? rr : []
        } catch {
          results[p.repo] = []
          releaseResults[p.repo] = []
        }
      }
      setCommits(results)
      setReleases(releaseResults)
      setLoading(false)
    }
    fetchAll()
  }, [])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-[#3b82f6]/20 border border-[#3b82f6]/30 flex items-center justify-center">
          <FolderGit2 className="w-4 h-4 text-[#3b82f6]" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">Projects</h1>
          <p className="text-sm text-white/40">Recent activity across your projects</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {PROJECTS.map(p => (
          <a key={p.repo} href={p.url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-colors group">
            <Github className="w-4 h-4 text-brand-400 shrink-0" />
            <div className="min-w-0">
              <span className="text-sm font-bold text-white/80 group-hover:text-white block truncate">{p.name}</span>
              <span className="text-[10px] font-mono text-white/30 truncate block">{p.repo}</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-white/20 shrink-0 ml-auto" />
          </a>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center gap-3 py-16 justify-center">
          <RefreshCw className="w-5 h-5 text-white/30 animate-spin" />
          <span className="text-sm text-white/30">Loading project updates...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {PROJECTS.map(p => {
            const projectCommits = commits[p.repo] || []
            const projectReleases = releases[p.repo] || []
            return (
              <div key={p.repo} className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-mono font-extrabold tracking-widest text-white/30 uppercase">{p.name}</span>
                  <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-mono text-brand-400/60 hover:text-brand-400">View on GitHub</a>
                </div>

                {projectReleases.length > 0 && (
                  <div className="mb-4">
                    <span className="text-[10px] font-mono text-white/30 font-bold block mb-2">Releases</span>
                    <div className="space-y-2">
                      {projectReleases.map((r: any) => (
                        <a key={r.id} href={r.html_url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] transition-colors group">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="text-xs font-bold text-white/70 group-hover:text-white flex-1">{r.tag_name}</span>
                          <span className="text-[10px] font-mono text-white/20">{r.published_at?.slice(0, 10)}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <span className="text-[10px] font-mono text-white/30 font-bold block mb-2">Recent Commits</span>
                  {projectCommits.length === 0 ? (
                    <p className="text-xs text-white/20 text-center py-4">No commits found</p>
                  ) : (
                    <div className="space-y-2">
                      {projectCommits.map((c: any) => (
                        <a key={c.sha} href={c.html_url} target="_blank" rel="noopener noreferrer"
                          className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] transition-colors group">
                          <GitCommit className="w-3.5 h-3.5 text-brand-400 shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-white/70 group-hover:text-white truncate">{c.commit?.message?.split("\n")[0] || "No message"}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-mono text-white/20">{c.commit?.author?.name}</span>
                              <span className="text-[10px] font-mono text-white/20">{c.commit?.author?.date?.slice(0, 10)}</span>
                              <span className="text-[9px] font-mono text-white/10">{c.sha?.slice(0, 7)}</span>
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
