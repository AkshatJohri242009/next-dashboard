"use client"

import { motion, useScroll, useSpring } from "framer-motion"

export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30 })

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-[100] origin-left"
      style={{
        scaleX,
        height: 2,
        backgroundColor: "var(--brand, #30D158)",
        boxShadow: "0 0 10px rgba(48,209,88,0.3)",
      }}
    />
  )
}
