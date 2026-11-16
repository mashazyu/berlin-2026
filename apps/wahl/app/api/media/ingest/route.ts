import { NextResponse } from "next/server"
import { ingestMediaArchive } from "@/lib/media/fetch-feeds"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
/** RSS pulls can take a while across feeds. */
export const maxDuration = 60

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim()
  if (!secret) {
    // Allow in local/dev without secret; require it in production.
    return process.env.NODE_ENV !== "production"
  }
  const header = request.headers.get("authorization")
  return header === `Bearer ${secret}`
}

async function runIngest(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const result = await ingestMediaArchive()
  return NextResponse.json(result)
}

/** Vercel Cron uses GET. */
export async function GET(request: Request) {
  return runIngest(request)
}

/** Manual trigger. */
export async function POST(request: Request) {
  return runIngest(request)
}
