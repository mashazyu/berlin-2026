"use client"

import { useEffect, useState } from "react"
import { ChevronDown } from "lucide-react"
import { RichText } from "@/components/rich-text"
import { useLanguage } from "@/components/language-provider"

const sectionShell =
  "flex scroll-mt-[var(--header-offset)] flex-col justify-start px-4 py-14 sm:px-6 sm:py-20"
const contentWide = "mx-auto w-full max-w-3xl"

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
      className="group border-b border-border"
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
  titleAs: TitleTag = "h2",
  id = "faq",
}: {
  titleAs?: "h1" | "h2"
  id?: string
}) {
  const { translations: t } = useLanguage()
  const [openId, setOpenId] = useState<string | undefined>()
  const faqs = t.faq.questions as FaqItem[]
  const projectFaqs = faqs.filter((faq) => faq.category === "project")
  const mapFaqs = faqs.filter((faq) => faq.category === "map")

  useEffect(() => {
    const hash = window.location.hash
    if (!hash.startsWith("#faq")) return
    const n = Number.parseInt(hash.replace("#faq", ""), 10)
    if (!Number.isFinite(n) || n < 1) return
    if (n > projectFaqs.length + mapFaqs.length) return
    const nextId = `faq${n}`
    setOpenId(nextId)
    requestAnimationFrame(() => {
      document.getElementById(nextId)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    })
  }, [projectFaqs.length, mapFaqs.length])

  function renderGroup(
    heading: string,
    subtitle: string,
    items: FaqItem[],
    indexOffset: number
  ) {
    return (
      <div className="mt-14 first:mt-10">
        <h3 className="font-display text-xl font-semibold tracking-[-0.01em] sm:text-2xl">
          {heading}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">{subtitle}</p>
        <div className="mt-6">
          {items.map((faq, index) => {
            const itemId = `faq${indexOffset + index + 1}`
            return (
              <FaqDetails
                key={`${faq.category}-${faq.id}`}
                id={itemId}
                question={faq.question}
                answer={faq.answer}
                open={openId === itemId}
                onOpenChange={(next) => setOpenId(next ? itemId : undefined)}
              />
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <section id={id} className={sectionShell}>
      <div className={`${contentWide} animate-[rise_0.55s_ease-out_both]`}>
        <TitleTag className="font-display text-3xl font-semibold tracking-[-0.01em] sm:text-4xl">
          {t.faq.title}
        </TitleTag>
        {t.faq.description ? (
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t.faq.description}
          </p>
        ) : null}
        {renderGroup(
          t.faq.projectFaqsHeading,
          t.faq.projectFaqsTitle,
          projectFaqs,
          0
        )}
        {renderGroup(
          t.faq.mapFaqsHeading,
          t.faq.mapFaqsTitle,
          mapFaqs,
          projectFaqs.length
        )}
      </div>
    </section>
  )
}
