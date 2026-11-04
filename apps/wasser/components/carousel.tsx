"use client"

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@kompass/ui/button"
import { cn } from "@kompass/ui/lib/utils"

export function Carousel({
  label,
  previousLabel,
  nextLabel,
  children,
  className,
}: {
  label: string
  previousLabel: string
  nextLabel: string
  children: ReactNode
  className?: string
}) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  const update = useCallback(() => {
    const el = scrollerRef.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    setCanPrev(el.scrollLeft > 4)
    setCanNext(el.scrollLeft < max - 4)
  }, [])

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    update()
    el.addEventListener("scroll", update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => {
      el.removeEventListener("scroll", update)
      ro.disconnect()
    }
  }, [update, children])

  function scrollByDir(dir: -1 | 1) {
    const el = scrollerRef.current
    if (!el) return
    const slide = el.querySelector<HTMLElement>("[data-carousel-slide]")
    const amount = slide ? slide.offsetWidth + 16 : el.clientWidth * 0.85
    el.scrollBy({ left: dir * amount, behavior: "smooth" })
  }

  return (
    <div className={cn("relative", className)}>
      <div
        ref={scrollerRef}
        role="region"
        aria-roledescription="carousel"
        aria-label={label}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
      <div className="mt-6 flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label={previousLabel}
          disabled={!canPrev}
          onClick={() => scrollByDir(-1)}
        >
          <ChevronLeft aria-hidden />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label={nextLabel}
          disabled={!canNext}
          onClick={() => scrollByDir(1)}
        >
          <ChevronRight aria-hidden />
        </Button>
      </div>
    </div>
  )
}

export function CarouselSlide({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      data-carousel-slide
      role="group"
      aria-roledescription="slide"
      className={cn(
        "w-[min(100%,20rem)] shrink-0 snap-start sm:w-[min(100%,22rem)]",
        className
      )}
    >
      {children}
    </div>
  )
}
