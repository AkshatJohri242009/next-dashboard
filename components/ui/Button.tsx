"use client"

import { forwardRef, type ReactNode } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface ButtonProps {
  children: ReactNode
  className?: string
  variant?: "primary" | "secondary" | "ghost" | "danger"
  size?: "sm" | "md" | "lg"
  icon?: ReactNode
  disabled?: boolean
  onClick?: () => void
  type?: "button" | "submit"
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "secondary", size = "md", icon, children, ...props }, ref) => (
    <motion.button
      ref={ref}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50",
        "disabled:opacity-40 disabled:pointer-events-none",
        variant === "primary" && "bg-brand-500 text-black hover:bg-brand-400 shadow-lg shadow-brand-500/20",
        variant === "secondary" && "glass hover:bg-white/[0.08] text-white/80 hover:text-white",
        variant === "ghost" && "bg-transparent hover:bg-white/[0.06] text-white/60 hover:text-white",
        variant === "danger" && "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20",
        size === "sm" && "h-8 px-3 text-xs",
        size === "md" && "h-10 px-4 text-sm",
        size === "lg" && "h-12 px-6 text-base",
        className,
      )}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </motion.button>
  ),
)
Button.displayName = "Button"
