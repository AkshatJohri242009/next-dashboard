"use client"

import { useRef } from "react"
import { useStore } from "@/lib/store"
import { useMediaQuery } from "@/lib/use-media-query"

export function SwipeHandler() {
  const isMobile = useMediaQuery("(max-width: 1023px)")
  const setMobileMenu = useStore(s => s.setMobileMenu)
  const mobileMenuOpen = useStore(s => s.mobileMenuOpen)
  const startX = useRef(0)
  const startY = useRef(0)

  if (!isMobile) return null

  return (
    <>
      <div
        onTouchStart={e => {
          startX.current = e.touches[0].clientX
          startY.current = e.touches[0].clientY
        }}
        onTouchEnd={e => {
          const dx = e.changedTouches[0].clientX - startX.current
          const dy = e.changedTouches[0].clientY - startY.current
          if (Math.abs(dy) > Math.abs(dx)) return
          if (startX.current < 35 && dx > 50 && !mobileMenuOpen) {
            setMobileMenu(true)
          }
          if (dx < -50 && mobileMenuOpen) {
            setMobileMenu(false)
          }
        }}
        className="fixed left-0 top-0 bottom-0 w-[35px] z-50"
      />
      {mobileMenuOpen && (
        <div
          onTouchStart={e => { startX.current = e.touches[0].clientX }}
          onTouchEnd={e => {
            const dx = e.changedTouches[0].clientX - startX.current
            if (dx < -50) setMobileMenu(false)
          }}
          className="fixed inset-0 z-30"
        />
      )}
    </>
  )
}
