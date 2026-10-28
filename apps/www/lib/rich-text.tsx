import type { ReactNode } from "react"

/** Minimal paragraph renderer with `[label](url)` markdown links. */
export function renderParagraphs(
  text: string,
  className = "text-muted-foreground leading-relaxed"
): ReactNode {
  const blocks = text.split(/\n\n+/).filter(Boolean)
  return blocks.map((block, index) => (
    <p key={index} className={`${className} whitespace-pre-line`}>
      {renderInline(block)}
    </p>
  ))
}

function renderInline(text: string): ReactNode[] {
  const parts: ReactNode[] = []
  const re = /\[([^\]]+)\]\(([^)]+)\)/g
  let last = 0
  let match: RegExpExecArray | null
  let key = 0
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index))
    }
    parts.push(
      <a
        key={key++}
        href={match[2]}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline-offset-4 hover:underline"
      >
        {match[1]}
      </a>
    )
    last = match.index + match[0].length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts
}
