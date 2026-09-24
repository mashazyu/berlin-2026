import type { ReactNode } from "react"

export type ContentBlock = {
  title: string
  body: ReactNode
}

export type ContentSectionProps = {
  id?: string
  title: string
  blocks: ContentBlock[]
}

export function ContentSection({
  id = "content",
  title,
  blocks,
}: ContentSectionProps) {
  return (
    <section
      id={id}
      className="scroll-mt-[4.25rem] bg-white px-4 py-16 sm:px-6 sm:py-20"
    >
      <div className="mx-auto max-w-3xl animate-[rise_0.55s_ease-out_both]">
        <h2 className="section-title font-display text-3xl font-semibold tracking-[-0.01em] sm:text-4xl">
          {title}
        </h2>
        <div className="space-y-10">
          {blocks.map((block) => (
            <div key={block.title}>
              <h3 className="font-display text-xl font-semibold tracking-[-0.01em] text-foreground">
                {block.title}
              </h3>
              <div className="mt-3 space-y-3 text-base text-muted-foreground leading-relaxed">
                {block.body}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
