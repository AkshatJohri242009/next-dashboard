"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface GlassPanelProps {
  children: React.ReactNode
  className?: string
  variant?: "default" | "strong"
  glow?: "green" | "amber" | "accent" | "none"
  hover?: boolean
}

export function GlassPanel({
  children, className, variant = "default",
  glow = "none", hover = false,
}: GlassPanelProps) {
  const glowMap = {
    none: "",
    green: "shadow-glow-green",
    amber: "shadow-glow-amber",
    accent: "shadow-glow-accent",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        variant === "strong" ? "glass-strong" : "glass",
        hover && "card-hover",
        glowMap[glow],
        "rounded-2xl p-5",
        className,
      )}
    >
      {children}
    </motion.div>
  )
}
