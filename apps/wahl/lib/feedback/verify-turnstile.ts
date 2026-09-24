export async function verifyTurnstileToken(
  token: string,
  remoteip?: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) {
    return { ok: false, error: "Turnstile is not configured" }
  }
  if (!token) {
    return { ok: false, error: "Missing Turnstile token" }
  }

  const body = new URLSearchParams()
  body.set("secret", secret)
  body.set("response", token)
  if (remoteip) body.set("remoteip", remoteip)

  const res = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
    }
  )

  if (!res.ok) {
    return { ok: false, error: "Turnstile verification request failed" }
  }

  const data = (await res.json()) as {
    success?: boolean
    "error-codes"?: string[]
  }

  if (!data.success) {
    return {
      ok: false,
      error: data["error-codes"]?.join(", ") || "Turnstile verification failed",
    }
  }

  return { ok: true }
}
