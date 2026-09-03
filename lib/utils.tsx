import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import React from "react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function renderParagraphs(
  text: string,
  className: string = "text-muted-foreground leading-relaxed",
  lang?: string
): React.JSX.Element[] {
  const parseBold = (value: string, keyPrefix: string): React.ReactNode[] => {
    const parts = value.split(/(\*\*[^*]+\*\*)/g)
    return parts.filter(Boolean).map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={`${keyPrefix}-b-${index}`}>{part.slice(2, -2)}</strong>
        )
      }
      return <React.Fragment key={`${keyPrefix}-t-${index}`}>{part}</React.Fragment>
    })
  }

  const parseLinks = (line: string): React.ReactNode => {
    const linkRegex = /\[([^\]]+)\]\(((?:[^()]+|\([^()]*\))*)\)/g
    const elements: React.ReactNode[] = []
    let lastIndex = 0
    let match: RegExpExecArray | null
    let linkIndex = 0

    while ((match = linkRegex.exec(line)) !== null) {
      const [fullMatch, label, rawUrl] = match
      if (match.index > lastIndex) {
        elements.push(
          ...parseBold(line.slice(lastIndex, match.index), `seg-${linkIndex}`)
        )
      }

      const url = lang ? rawUrl.replace("{lang}", lang) : rawUrl
      const isLocalLink = url.startsWith("/") || url.startsWith("#")
      elements.push(
        <a
          key={`link-${linkIndex}`}
          href={url}
          target={isLocalLink ? undefined : "_blank"}
          rel={isLocalLink ? undefined : "noopener noreferrer"}
          className="text-primary hover:underline"
        >
          {parseBold(label, `label-${linkIndex}`)}
        </a>
      )

      lastIndex = match.index + fullMatch.length
      linkIndex++
    }

    if (lastIndex < line.length) {
      elements.push(...parseBold(line.slice(lastIndex), `tail-${linkIndex}`))
    }

    if (elements.length === 0) return <>{parseBold(line, "plain")}</>
    return <>{elements}</>
  }

  const lines = text.split(/\r?\n/)
  const result: React.JSX.Element[] = []
  let listItems: string[] = []
  let blockIndex = 0

  const flushList = () => {
    if (listItems.length > 0) {
      result.push(
        <ul key={`list-${blockIndex}`} className="mb-4 list-inside list-disc space-y-1">
          {listItems.map((item, i) => (
            <li key={i}>{parseLinks(item.replace(/^[•·-]\s*/, ""))}</li>
          ))}
        </ul>
      )
      listItems = []
      blockIndex++
    }
  }

  let paragraphLines: string[] = []
  const isBullet = (line: string) => /^([•·-]\s*)/.test(line.trim())

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (line === "") {
      flushList()
      if (paragraphLines.length > 0) {
        result.push(
          <p key={`p-${blockIndex}`} className={className}>
            {parseLinks(paragraphLines.join(" "))}
          </p>
        )
        paragraphLines = []
        blockIndex++
      }
      continue
    }
    if (isBullet(line)) {
      if (paragraphLines.length > 0) {
        result.push(
          <p key={`p-${blockIndex}`} className={className}>
            {parseLinks(paragraphLines.join(" "))}
          </p>
        )
        paragraphLines = []
        blockIndex++
      }
      listItems.push(line)
      const nextLine = lines[i + 1]?.trim() || ""
      if (!isBullet(nextLine)) flushList()
    } else {
      flushList()
      paragraphLines.push(line)
    }
  }
  flushList()
  if (paragraphLines.length > 0) {
    result.push(
      <p key={`p-${blockIndex}`} className={className}>
        {parseLinks(paragraphLines.join(" "))}
      </p>
    )
  }

  return result
}
