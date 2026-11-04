"use client"

import { useEffect, useState } from "react"
import { ChevronDown } from "lucide-react"
import { PageSection } from "@kompass/landing"
import { Separator } from "@kompass/ui/separator"
import { RichText } from "@/components/rich-text"
import { useLanguage } from "@/components/language-provider"

type FaqItem = {
  id: number | string
  category: string
  question: string
  answer: string
}

function FaqDetails({
  id,
  question,
  answer,
  open,
  onOpenChange,
}: {
  id: string
  question: string
  answer: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <details
      id={id}
      className="group"
      open={open}
      onToggle={(event) => {
        const nextOpen = (event.currentTarget as HTMLDetailsElement).open
        if (nextOpen === open) return
        onOpenChange(nextOpen)
      }}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between py-5 text-left font-medium text-foreground transition-colors hover:bg-muted/40 [&::-webkit-details-marker]:hidden">
        <span className="pr-4">{question}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>
      <div className="pb-5">
        <RichText
          text={answer}
          className="text-base leading-relaxed text-muted-foreground"
        />
      </div>
    </details>
  )
}

export function FaqSection({
  titleAs = "h1",
  id = "faq",
  muted = false,
  width = "narrow",
  columns = 1,
}: {
  titleAs?: "h1" | "h2"
  id?: string
  muted?: boolean
  width?: "narrow" | "wide"
  /** 2 columns from lg up; 1 column on tablet and phone. */
  columns?: 1 | 2
}) {
  const { translations: t } = useLanguage()
  const [openId, setOpenId] = useState<string | undefined>()
  const faqs = t.faq.questions as FaqItem[]
  const projectFaqs = faqs.filter((faq) => faq.category === "project")
  const mapFaqs = faqs.filter((faq) => faq.category === "map")

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "")
    if (!hash) return
    const match =
      faqs.find((faq) => String(faq.id) === hash) ??
      (hash.startsWith("faq") ? faqs.find((_, i) => `faq${i + 1}` === hash) : undefined)
    if (!match) return
    const nextId = String(match.id)
    setOpenId(nextId)
    requestAnimationFrame(() => {
      document.getElementById(nextId)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    })
  }, [faqs])

  function renderGroup(heading: string, subtitle: string, items: FaqItem[]) {
    const listClass =
      columns === 2
        ? "mt-6 grid grid-cols-1 gap-x-10 lg:grid-cols-2"
        : "mt-6"

    return (
      <div className="mt-14 first:mt-10">
        <h3 className="font-display text-xl font-semibold tracking-[-0.01em] sm:text-2xl">
          {heading}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">{subtitle}</p>
        <div className={listClass}>
          {items.map((faq) => {
            const itemId = String(faq.id)
            return (
              <div
                key={`${faq.category}-${faq.id}`}
                className={columns === 2 ? "border-b border-border" : undefined}
              >
                <FaqDetails
                  id={itemId}
                  question={faq.question}
                  answer={faq.answer}
                  open={openId === itemId}
                  onOpenChange={(next) => setOpenId(next ? itemId : undefined)}
                />
                {columns === 1 ? <Separator /> : null}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <PageSection
      id={id}
      title={t.faq.title}
      titleAs={titleAs}
      muted={muted}
      width={width}
      fillViewport={false}
    >
      {t.faq.description ? (
        <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
          {t.faq.description}
        </p>
      ) : null}
      {renderGroup(
        t.faq.projectFaqsHeading,
        t.faq.projectFaqsTitle,
        projectFaqs
      )}
      {renderGroup(t.faq.mapFaqsHeading, t.faq.mapFaqsTitle, mapFaqs)}
    </PageSection>
  )
}
