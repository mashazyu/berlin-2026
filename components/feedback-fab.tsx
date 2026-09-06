"use client"

import { useCallback, useEffect, useState } from "react"
import { MessageSquare, PencilLine } from "lucide-react"
import { FeedbackDialog } from "@/components/feedback-dialog"
import { TextReportDialog } from "@/components/text-report-dialog"
import { useLanguage } from "@/components/language-provider"
import { cn } from "@/lib/utils"

const MIN_SELECTION = 3
const MAX_SELECTION = 4000

type SelectionChip = {
  text: string
  left: number
  top: number
}

function isEditableTarget(node: Node | null): boolean {
  if (!node) return false
  const el =
    node.nodeType === Node.ELEMENT_NODE
      ? (node as Element)
      : node.parentElement
  if (!el) return false
  return Boolean(
    el.closest(
      "input, textarea, select, [contenteditable='true'], [role='dialog'], [data-no-text-report]"
    )
  )
}

function readPageSelection(): { text: string; rect: DOMRect } | null {
  const sel = window.getSelection()
  if (!sel || sel.isCollapsed || sel.rangeCount === 0) return null
  const text = sel.toString().replace(/\s+/g, " ").trim()
  if (text.length < MIN_SELECTION || text.length > MAX_SELECTION) return null
  if (isEditableTarget(sel.anchorNode) || isEditableTarget(sel.focusNode)) {
    return null
  }
  const range = sel.getRangeAt(0)
  const rect = range.getBoundingClientRect()
  if (rect.width === 0 && rect.height === 0) return null
  return { text, rect }
}

function chipPosition(rect: DOMRect): { left: number; top: number } {
  const pad = 8
  const chipW = 160
  const chipH = 36
  let left = rect.left + rect.width / 2 - chipW / 2
  let top = rect.top - chipH - pad
  left = Math.max(pad, Math.min(left, window.innerWidth - chipW - pad))
  if (top < pad) top = rect.bottom + pad
  top = Math.max(pad, Math.min(top, window.innerHeight - chipH - pad))
  return { left, top }
}

/** Quiet FAB + selection chip for text reports. */
export function FeedbackFab() {
  const { translations: t } = useLanguage()
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [textReportOpen, setTextReportOpen] = useState(false)
  const [initialIncorrect, setInitialIncorrect] = useState("")
  const [chip, setChip] = useState<SelectionChip | null>(null)

  const hideChip = useCallback(() => setChip(null), [])

  const showFromSelection = useCallback(() => {
    if (feedbackOpen || textReportOpen) {
      setChip(null)
      return
    }
    const found = readPageSelection()
    if (!found) {
      setChip(null)
      return
    }
    const { left, top } = chipPosition(found.rect)
    setChip({ text: found.text, left, top })
  }, [feedbackOpen, textReportOpen])

  useEffect(() => {
    let debounceId = 0
    const schedule = () => {
      window.clearTimeout(debounceId)
      debounceId = window.setTimeout(showFromSelection, 80)
    }
    const onScroll = () => hideChip()
    const onCopy = () => {
      if (feedbackOpen || textReportOpen) return
      const found = readPageSelection()
      if (!found) return
      const { left, top } = chipPosition(found.rect)
      setChip({ text: found.text, left, top })
    }

    document.addEventListener("mouseup", schedule)
    document.addEventListener("touchend", schedule, { passive: true })
    document.addEventListener("selectionchange", schedule)
    document.addEventListener("copy", onCopy)
    window.addEventListener("scroll", onScroll, true)
    window.addEventListener("resize", hideChip)
    return () => {
      window.clearTimeout(debounceId)
      document.removeEventListener("mouseup", schedule)
      document.removeEventListener("touchend", schedule)
      document.removeEventListener("selectionchange", schedule)
      document.removeEventListener("copy", onCopy)
      window.removeEventListener("scroll", onScroll, true)
      window.removeEventListener("resize", hideChip)
    }
  }, [showFromSelection, hideChip, feedbackOpen, textReportOpen])

  function openFromFab() {
    hideChip()
    setFeedbackOpen(true)
  }

  function openTextReport(text: string) {
    setInitialIncorrect(text)
    setChip(null)
    setTextReportOpen(true)
  }

  return (
    <>
      <button
        type="button"
        onClick={openFromFab}
        aria-label={t.feedback.fabLabel}
        title={t.feedback.fabLabel}
        className={cn(
          "fixed right-4 bottom-4 z-40 flex h-10 w-10 items-center justify-center rounded-full",
          "border border-border/80 bg-white/90 text-muted-foreground shadow-sm backdrop-blur-sm",
          "transition-colors hover:border-border hover:bg-white hover:text-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "sm:right-5 sm:bottom-5"
        )}
      >
        <MessageSquare className="h-4 w-4" strokeWidth={1.75} aria-hidden />
      </button>

      {chip ? (
        <button
          type="button"
          data-no-text-report
          style={{ left: chip.left, top: chip.top }}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => openTextReport(chip.text)}
          className={cn(
            "fixed z-40 inline-flex max-w-[min(90vw,14rem)] items-center gap-1.5 rounded-full",
            "border border-border bg-white px-3 py-1.5 text-sm font-medium text-foreground shadow-md",
            "transition-colors hover:bg-muted/60",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}
        >
          <PencilLine className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
          <span className="truncate">{t.textReport.selectionAction}</span>
        </button>
      ) : null}

      <FeedbackDialog open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
      <TextReportDialog
        open={textReportOpen}
        initialIncorrect={initialIncorrect}
        onClose={() => {
          setTextReportOpen(false)
          setInitialIncorrect("")
        }}
      />
    </>
  )
}

