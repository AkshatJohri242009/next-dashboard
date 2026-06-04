"use client"

import { useRef } from "react"
import { Camera } from "lucide-react"
import { useStore } from "@/lib/store"

export function ProgressPhotos() {
  const { gym, setPhoto } = useStore()
  const aRef = useRef<HTMLInputElement>(null)
  const bRef = useRef<HTMLInputElement>(null)

  const handleFile = (id: string, file: File | undefined) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPhoto(id, reader.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {(["photoA", "photoB"] as const).map((id, idx) => (
        <div
          key={id}
          onClick={() => (idx === 0 ? aRef : bRef).current?.click()}
          className="relative flex items-center justify-center min-h-[240px] rounded-xl border-2 border-dashed border-white/[0.12] bg-white/[0.02] cursor-pointer overflow-hidden group"
        >
          {gym.photos[id] ? (
            <img src={gym.photos[id]} alt={idx === 0 ? "Before" : "After"} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-text-tertiary">
              <Camera className="w-6 h-6" />
              <span className="text-[11px] font-mono font-bold tracking-wider uppercase">
                {idx === 0 ? "Before" : "After"}
              </span>
            </div>
          )}
          <input
            ref={idx === 0 ? aRef : bRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => handleFile(id, e.target.files?.[0])}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors pointer-events-none" />
        </div>
      ))}
    </div>
  )
}
