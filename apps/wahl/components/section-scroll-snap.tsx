"use client"

import { useEffect, useRef } from "react"
import { snapNearestSectionIfNeeded } from "@/lib/scroll-to-section"

/**
 * Free-scroll settle snap (skips hero) + single rubber-band bounce at page edges.
 */
export function SectionScrollSnap() {
  const suppressUntil = useRef(0)
  const bouncing = useRef(false)
  const armedTop = useRef(true)
  const armedBottom = useRef(true)

  useEffect(() => {
    let settleTimer: number | undefined
    let clearBounceTimer: number | undefined
    const body = document.body

    const suppress = (ms = 700) => {
      suppressUntil.current = Date.now() + ms
    }

    const onNavStart = () => suppress(800)

    const scheduleSnap = () => {
      const y = window.scrollY
      const maxScroll = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight
      )
      if (y > 24) armedTop.current = true
      if (y < maxScroll - 24) armedBottom.current = true

      window.clearTimeout(settleTimer)
      settleTimer = window.setTimeout(() => {
        if (Date.now() < suppressUntil.current) return
        if (bouncing.current) return
        suppress(500)
        snapNearestSectionIfNeeded()
      }, 160)
    }

    const playBounce = (edge: "top" | "bottom") => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
      if (bouncing.current) return
      if (edge === "top" && !armedTop.current) return
      if (edge === "bottom" && !armedBottom.current) return

      bouncing.current = true
      if (edge === "top") armedTop.current = false
      else armedBottom.current = false

      body.classList.remove("edge-bounce-top", "edge-bounce-bottom")
      void body.offsetWidth
      body.classList.add(edge === "top" ? "edge-bounce-top" : "edge-bounce-bottom")

      window.clearTimeout(clearBounceTimer)
      clearBounceTimer = window.setTimeout(() => {
        body.classList.remove("edge-bounce-top", "edge-bounce-bottom")
        bouncing.current = false
      }, 720)
    }

    const onWheel = (event: WheelEvent) => {
      // Ignore tiny trackpad noise
      if (Math.abs(event.deltaY) < 4) return

      const maxScroll = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight
      )
      const y = window.scrollY

      if (y <= 1 && event.deltaY < 0) {
        playBounce("top")
      } else if (y >= maxScroll - 1 && event.deltaY > 0) {
        playBounce("bottom")
      }
    }

    let lastTouchY = 0
    const onTouchStart = (event: TouchEvent) => {
      lastTouchY = event.touches[0]?.clientY ?? 0
    }
    const onTouchMove = (event: TouchEvent) => {
      const touchY = event.touches[0]?.clientY ?? lastTouchY
      const delta = lastTouchY - touchY
      lastTouchY = touchY

      const maxScroll = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight
      )
      const scrollY = window.scrollY

      if (scrollY <= 1 && delta < -12) {
        playBounce("top")
      } else if (scrollY >= maxScroll - 1 && delta > 12) {
        playBounce("bottom")
      }
    }

    window.addEventListener("section-nav-start", onNavStart)
    window.addEventListener("scroll", scheduleSnap, { passive: true })
    window.addEventListener("scrollend", scheduleSnap)
    window.addEventListener("wheel", onWheel, { passive: true })
    window.addEventListener("touchstart", onTouchStart, { passive: true })
    window.addEventListener("touchmove", onTouchMove, { passive: true })

    return () => {
      window.clearTimeout(settleTimer)
      window.clearTimeout(clearBounceTimer)
      window.removeEventListener("section-nav-start", onNavStart)
      window.removeEventListener("scroll", scheduleSnap)
      window.removeEventListener("scrollend", scheduleSnap)
      window.removeEventListener("wheel", onWheel)
      window.removeEventListener("touchstart", onTouchStart)
      window.removeEventListener("touchmove", onTouchMove)
      body.classList.remove("edge-bounce-top", "edge-bounce-bottom")
    }
  }, [])

  return null
}
