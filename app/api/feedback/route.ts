import { NextResponse } from "next/server"
import { Resend } from "resend"
import { verifyTurnstileToken } from "@/lib/feedback/verify-turnstile"

export const runtime = "nodejs"

const MAX_MESSAGE = 4000
const MAX_CONTEXT = 500
const MAX_EMAIL = 200

type FeedbackBody = {
  kind?: "feedback" | "text-report"
  message?: string
  incorrectText?: string
  suggestedText?: string
  email?: string
  pageUrl?: string
  locale?: string
  context?: string
  turnstileToken?: string
  /** Honeypot — must stay empty */
  company?: string
}

function clientIp(request: Request): string | undefined {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0]?.trim()
  return request.headers.get("x-real-ip") ?? undefined
}

export async function POST(request: Request) {
  let body: FeedbackBody
  try {
    body = (await request.json()) as FeedbackBody
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  if (body.company) {
    return NextResponse.json({ ok: true })
  }

  const kind = body.kind === "text-report" ? "text-report" : "feedback"

  let message = ""
  if (kind === "text-report") {
    const incorrect = (body.incorrectText ?? "").trim()
    const suggested = (body.suggestedText ?? "").trim()
    if (
      incorrect.length < 3 ||
      suggested.length < 3 ||
      incorrect.length > MAX_MESSAGE ||
      suggested.length > MAX_MESSAGE
    ) {
      return NextResponse.json(
        { error: "Incorrect and suggested text are required (3–4000 characters)" },
        { status: 400 }
      )
    }
    message = [
      "Incorrect text:",
      incorrect,
      "",
      "Suggested version:",
      suggested,
    ].join("\n")
  } else {
    message = (body.message ?? "").trim()
    if (message.length < 10 || message.length > MAX_MESSAGE) {
      return NextResponse.json(
        { error: "Message must be between 10 and 4000 characters" },
        { status: 400 }
      )
    }
  }

  const email = (body.email ?? "").trim()
  if (email && (email.length > MAX_EMAIL || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 })
  }

  const turnstile = await verifyTurnstileToken(
    body.turnstileToken ?? "",
    clientIp(request)
  )
  if (!turnstile.ok) {
    return NextResponse.json({ error: turnstile.error }, { status: 403 })
  }

  const pageUrl = (body.pageUrl ?? "").slice(0, MAX_CONTEXT)
  const locale = (body.locale ?? "").slice(0, 16)
  const context = (body.context ?? "").slice(0, MAX_CONTEXT)
  const to = process.env.FEEDBACK_TO_EMAIL || "feedback.berlin.2026@gmail.com"
  const subject =
    kind === "text-report"
      ? `[Berlin 2026] Text correction (${locale || "site"})`
      : `[Berlin 2026] Feedback (${locale || "site"})`
  const text = [
    message,
    "",
    "---",
    `Type: ${kind}`,
    `Page: ${pageUrl || "(unknown)"}`,
    `Locale: ${locale || "(unknown)"}`,
    context ? `Context: ${context}` : null,
    email ? `Reply-to: ${email}` : "Reply-to: (not provided)",
  ]
    .filter(Boolean)
    .join("\n")

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    if (process.env.NODE_ENV === "development") {
      console.info("[feedback] RESEND_API_KEY missing — logging only:\n", text)
      return NextResponse.json({ ok: true, mode: "dev-log" })
    }
    return NextResponse.json(
      { error: "Feedback email is not configured" },
      { status: 503 }
    )
  }

  const resend = new Resend(apiKey)
  const from =
    process.env.FEEDBACK_FROM_EMAIL || "Berlin 2026 <onboarding@resend.dev>"

  const { error } = await resend.emails.send({
    from,
    to: [to],
    replyTo: email || undefined,
    subject,
    text,
  })

  if (error) {
    console.error("[feedback] Resend error:", error)
    return NextResponse.json(
      {
        error:
          error.message?.includes("domain is not verified")
            ? "Email domain is not verified in Resend yet. Use onboarding@resend.dev as FEEDBACK_FROM_EMAIL until DNS is verified."
            : "Failed to send feedback",
      },
      { status: 502 }
    )
  }

  return NextResponse.json({ ok: true })
}
