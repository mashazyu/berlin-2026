"use client"

import { useCallback, useEffect, useId, useState } from "react"
import { X } from "lucide-react"
import { Turnstile } from "@marsidev/react-turnstile"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"
import { cn } from "@/lib/utils"

type FeedbackDialogProps = {
  open: boolean
  onClose: () => void
}

export function FeedbackDialog({ open, onClose }: FeedbackDialogProps) {
  const { language, translations: t } = useLanguage()
  const f = t.feedback
  const titleId = useId()
  const [message, setMessage] = useState("")
  const [email, setEmail] = useState("")
  const [company, setCompany] = useState("")
  const [token, setToken] = useState<string | null>(null)
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle")
  const [error, setError] = useState<string | null>(null)
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  const reset = useCallback(() => {
    setMessage("")
    setEmail("")
    setCompany("")
    setToken(null)
    setStatus("idle")
    setError(null)
  }, [])

  useEffect(() => {
    if (!open) reset()
  }, [open, reset])

  function handleClose() {
    reset()
    onClose()
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!token) {
      setError(f.captchaRequired)
      setStatus("error")
      return
    }
    setStatus("sending")
    setError(null)
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          kind: "feedback",
          message,
          email: email || undefined,
          pageUrl: typeof window !== "undefined" ? window.location.href : undefined,
          locale: language,
          turnstileToken: token,
          company,
        }),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        setError(data.error || f.error)
        setStatus("error")
        return
      }
      setStatus("ok")
    } catch {
      setError(f.error)
      setStatus("error")
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-4 sm:items-center"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-lg rounded-xl border border-border bg-white p-5 shadow-lg sm:p-6"
      >
        <button
          type="button"
          onClick={handleClose}
          aria-label={f.close}
          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>

        {status === "ok" ? (
          <p id={titleId} className="pr-8 text-base text-foreground" role="status">
            {f.success}
          </p>
        ) : (
          <>
            <h2 id={titleId} className="pr-8 font-display text-xl font-semibold tracking-[-0.01em]">
              {f.title}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{f.intro}</p>
            <form className="mt-5 space-y-4" onSubmit={onSubmit}>
              <p className="rounded-md border border-border bg-muted/40 px-3 py-2.5 text-sm text-muted-foreground">
                {f.textReportHint}
              </p>
              <div>
                <label htmlFor="feedback-message" className="text-sm font-medium text-foreground">
                  {f.messageLabel}
                </label>
                <textarea
                  id="feedback-message"
                  required
                  minLength={10}
                  maxLength={4000}
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={f.messagePlaceholder}
                  className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label htmlFor="feedback-email" className="text-sm font-medium text-foreground">
                  {f.emailLabel}
                </label>
                <input
                  id="feedback-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={f.emailPlaceholder}
                  className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                <label htmlFor="feedback-company">Company</label>
                <input
                  id="feedback-company"
                  tabIndex={-1}
                  autoComplete="off"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>
              {siteKey ? (
                <Turnstile
                  siteKey={siteKey}
                  onSuccess={setToken}
                  onExpire={() => setToken(null)}
                  onError={() => setToken(null)}
                  options={{ theme: "light", size: "flexible" }}
                />
              ) : (
                <p className="text-sm text-destructive">{f.captchaMissing}</p>
              )}
              {error ? (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              ) : null}
              <div className="flex flex-wrap gap-2 pt-1">
                <Button type="submit" disabled={status === "sending" || !siteKey}>
                  {status === "sending" ? f.sending : f.submit}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className={cn(status === "sending" && "pointer-events-none opacity-50")}
                >
                  {f.cancel}
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
