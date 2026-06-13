"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"

type EntryEffect = "fade-slide" | "scale-reveal" | "blur-in"

interface StorySectionProps {
  children: React.ReactNode
  className?: string
  id?: string
  height?: string
  sticky?: boolean
  entryEffect?: EntryEffect
}

const entryVariants: Record<EntryEffect, any> = {
  "fade-slide": { initial: { opacity: 0, y: 40 }, whileInView: { opacity: 1, y: 0 } },
  "scale-reveal": { initial: { opacity: 0, scale: 0.92 }, whileInView: { opacity: 1, scale: 1 } },
  "blur-in": { initial: { opacity: 0, filter: "blur(8px)" }, whileInView: { opacity: 1, filter: "blur(0px)" } },
}

export function StorySection({
  children, className = "", id, height = "auto", sticky = false, entryEffect = "fade-slide",
}: StorySectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0])
  const y = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [40, 0, 0, -30])
  const scale = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0.95, 1, 1, 0.97])

  const variant = entryVariants[entryEffect]

  return (
    <div ref={ref} id={id} className={`relative ${sticky ? `h-[${height}]` : ""} ${className}`}>
      {sticky ? (
        <motion.div
          className="sticky top-0 h-screen flex items-center justify-center overflow-hidden"
          style={{ opacity }}
        >
          <motion.div
            initial={variant.initial}
            whileInView={variant.whileInView}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="w-full"
          >
            {children}
          </motion.div>
        </motion.div>
      ) : (
        <motion.div style={{ opacity, y, scale }}>
          <motion.div
            initial={variant.initial}
            whileInView={variant.whileInView}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
