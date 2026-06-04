"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface GlassPanelProps {
  children: React.ReactNode
  className?: string
  variant?: "default" | "strong" | "elevated" | "tinted" | "accent" | "vibrant" | "strongVibrant" | "ultraThin" | "thin"
  glow?: "brand" | "accent" | "none"
  hover?: boolean
  rounded?: "sm" | "md" | "lg" | "xl"
  padding?: "sm" | "md" | "lg"
}

export function GlassPanel({
  children, className, variant = "default",
  glow = "none", hover = false,
  rounded = "lg", padding = "md",
}: GlassPanelProps) {
  const glassClasses: Record<string, string> = {
    default: "glass",
    strong: "glass-strong",
    elevated: "glass-elevated",
    tinted: "glass-tinted",
    accent: "glass-accent",
    vibrant: "glass-vibrant",
    strongVibrant: "glass-strong-vibrant",
    ultraThin: "glass-ultrathin",
    thin: "glass-sm",
  }

  const glowClasses: Record<string, string> = {
    none: "",
    brand: "shadow-glow-brand",
    accent: "shadow-glow-accent",
  }

  const radiusClasses: Record<string, string> = {
    sm: "ios-rounded-sm",
    md: "ios-rounded-md",
    lg: "ios-rounded-lg",
    xl: "ios-rounded-xl",
  }

  const paddingClasses: Record<string, string> = {
    sm: "p-3",
    md: "p-4 sm:p-5",
    lg: "p-5 sm:p-7",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        glassClasses[variant],
        hover && "card-hover",
        glowClasses[glow],
        radiusClasses[rounded],
        paddingClasses[padding],
        className,
      )}
    >
      {children}
    </motion.div>
  )
}
