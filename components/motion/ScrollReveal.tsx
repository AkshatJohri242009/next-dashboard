"use client"

import { useRef, ReactNode } from "react"
import { motion, useScroll, useTransform, useInView } from "framer-motion"

type RevealEffect = "fade" | "slide-up" | "slide-down" | "slide-left" | "slide-right" | "scale" | "rotate"

interface ScrollRevealProps {
  children: ReactNode
  effect?: RevealEffect
  delay?: number
  duration?: number
  className?: string
  once?: boolean
}

const variants: Record<RevealEffect, { hidden: any; visible: any }> = {
  "fade": { hidden: { opacity: 0 }, visible: { opacity: 1 } },
  "slide-up": { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } },
  "slide-down": { hidden: { opacity: 0, y: -40 }, visible: { opacity: 1, y: 0 } },
  "slide-left": { hidden: { opacity: 0, x: 40 }, visible: { opacity: 1, x: 0 } },
  "slide-right": { hidden: { opacity: 0, x: -40 }, visible: { opacity: 1, x: 0 } },
  "scale": { hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } },
  "rotate": { hidden: { opacity: 0, rotate: -6, scale: 0.95 }, visible: { opacity: 1, rotate: 0, scale: 1 } },
}

export function ScrollReveal({
  children, effect = "slide-up", delay = 0, duration = 0.7, className, once = true,
}: ScrollRevealProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once })

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{ hidden: variants[effect].hidden, visible: { ...variants[effect].visible, transition: { duration, delay, ease: [0.22, 1, 0.36, 1] } } }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface ParallaxProps {
  children: ReactNode
  speed?: number
  className?: string
}

export function ParallaxScroll({ children, speed = 0.2, className }: ParallaxProps) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const y = useTransform(scrollYProgress, [0, 1], [speed * 100, -speed * 100])

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  )
}

interface BlurToFocusProps {
  children: ReactNode
  className?: string
  blurAmount?: number
}

export function BlurToFocus({ children, className, blurAmount = 6 }: BlurToFocusProps) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const blur = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [blurAmount, 0, 0, blurAmount])
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ filter: `blur(${blur}px)` as any, opacity } as any}>{children}</motion.div>
    </div>
  )
}

interface StaggerProps {
  children: ReactNode
  stagger?: number
  delay?: number
  className?: string
}

export function Stagger({ children, stagger = 0.05, delay = 0, className }: StaggerProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-60px" })

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function StaggerChild({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 16, filter: "blur(4px)" },
        visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
