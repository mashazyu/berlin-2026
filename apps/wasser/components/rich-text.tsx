"use client"

import type { ReactNode } from "react"

/** Lightweight markdown links + paragraph breaks (ported from water4all TextParser). */
export function RichText({
  text,
  className = "",
}: {
  text: string
  className?: string
}) {
  function renderWithLinks(chunk: string): ReactNode {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
    const parts = chunk.split(linkRegex)
    if (parts.length === 1) return chunk

    const elements: ReactNode[] = []
    for (let i = 0; i < parts.length; i += 3) {
      if (parts[i]) elements.push(<span key={`t-${i}`}>{parts[i]}</span>)
      if (parts[i + 1] && parts[i + 2]) {
        const href = parts[i + 2]
        const isLocal = href.startsWith("/") || href.startsWith("#")
        elements.push(
          <a
            key={`l-${i}`}
            href={href}
            target={isLocal ? undefined : "_blank"}
            rel={isLocal ? undefined : "noopener noreferrer"}
            className="text-primary underline hover:underline"
          >
            {parts[i + 1]}
          </a>
        )
      }
    }
    return <>{elements}</>
  }

  const paragraphs = text.split(/\n\n+/)
  return (
    <div className={className}>
      {paragraphs.map((paragraph, index) => (
        <p key={index} className={index > 0 ? "mt-4" : undefined}>
          {renderWithLinks(paragraph.trim())}
        </p>
      ))}
    </div>
  )
}
