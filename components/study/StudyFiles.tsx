"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Upload, Download, Trash2, FileText, HardDrive } from "lucide-react"
import { markModified, autoSync } from "@/lib/store"
import type { StudyFile } from "@/lib/study-types"

const STORAGE_KEY = "study_files_v1"
const MAX_BYTES = 10 * 1024 * 1024

function storeGet<T>(key: string): T | null {
  try { return JSON.parse(localStorage.getItem(key) || "null") }
  catch { return null }
}
function storeSet(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
  localStorage.setItem("_ts:" + key, new Date().toISOString())
  markModified(key); autoSync()
}

export function StudyFiles() {
  const [files, setFiles] = useState<StudyFile[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const saved = storeGet<StudyFile[]>(STORAGE_KEY) || []
    setFiles(saved)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => storeSet(STORAGE_KEY, files), 300)
    return () => clearTimeout(t)
  }, [files])

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_BYTES) {
      alert("File too large (max 10 MB)")
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const data = reader.result as string
      const sf: StudyFile = {
        id: `sf_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        data,
        createdAt: Date.now(),
      }
      setFiles(prev => [...prev, sf])
    }
    reader.readAsDataURL(file)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  function download(f: StudyFile) {
    const a = document.createElement("a")
    a.href = f.data
    a.download = f.name
    a.click()
  }

  function remove(id: string) {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const totalSize = files.reduce((acc, f) => acc + f.size, 0)

  function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="glass rounded-2xl p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <span className="section-label">
          Study Files
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="glass rounded-xl p-3 text-center space-y-1">
          <FileText className="w-4 h-4 text-brand-400 mx-auto" />
          <span className="block text-lg font-extrabold tabular-nums text-white/80">{files.length}</span>
          <span className="text-xs font-mono text-white/30">Files</span>
        </div>
        <div className="glass rounded-xl p-3 text-center space-y-1">
          <HardDrive className="w-4 h-4 text-blue-400 mx-auto" />
          <span className="block text-lg font-extrabold tabular-nums text-white/80">{formatBytes(totalSize)}</span>
          <span className="text-xs font-mono text-white/30">Storage</span>
        </div>
      </div>

      <div>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleUpload}
          className="hidden"
          accept="*/*"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-brand-500/20 border border-brand-500/30 text-brand-300 text-sm font-bold hover:bg-brand-500/30 transition-colors"
        >
          <Upload className="w-4 h-4" />
          Upload File
        </button>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-hide">
        {files.length === 0 && (
          <p className="text-sm text-white/20 text-center py-6">No files yet — upload one above</p>
        )}
        {files.map((f) => (
          <motion.div
            key={f.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors group"
          >
            <FileText className="w-4 h-4 text-white/30 shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-sm text-white/70 block truncate">{f.name}</span>
              <span className="text-[11px] font-mono text-white/30">{formatBytes(f.size)}</span>
            </div>
            <button
              onClick={() => download(f)}
              className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-white/20 hover:text-blue-400 h-8 w-8 flex items-center justify-center"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => remove(f.id)}
              className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-white/20 hover:text-red-400 h-8 w-8 flex items-center justify-center"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
