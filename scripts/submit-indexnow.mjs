#!/usr/bin/env node
/**
 * Notify IndexNow (Bing et al.) that indexable URLs were published/updated.
 * Run after a production deploy: `pnpm indexnow:submit`
 *
 * Optional: INDEXNOW_KEY env overrides the default key in lib/seo/indexnow.ts
 * (must still match a key file at https://www.berlin-2026.de/{key}.txt).
 */
import { readFileSync, readdirSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, "..")

const BASE_URL = "https://www.berlin-2026.de"
const INDEXABLE_PATHS = ["", "/about"]

function resolveSupportedLanguages() {
  const src = readFileSync(join(root, "lib/seo/constants.ts"), "utf8")
  const match = src.match(
    /export const SUPPORTED_LANGUAGES\s*=\s*\[([\s\S]*?)\]\s*as const/
  )
  if (!match) throw new Error("SUPPORTED_LANGUAGES not found in lib/seo/constants.ts")
  const langs = [...match[1].matchAll(/"([a-z]{2})"/g)].map((m) => m[1])
  if (langs.length === 0) throw new Error("SUPPORTED_LANGUAGES is empty")
  return langs
}

function resolveKey() {
  if (process.env.INDEXNOW_KEY?.trim()) {
    return process.env.INDEXNOW_KEY.trim()
  }
  const match = readFileSync(join(root, "lib/seo/indexnow.ts"), "utf8").match(
    /INDEXNOW_KEY\s*=\s*"([a-zA-Z0-9-]+)"/
  )
  if (match) return match[1]
  const publicFiles = readdirSync(join(root, "public"))
  const keyFile = publicFiles.find((name) => /^[a-zA-Z0-9-]{8,128}\.txt$/.test(name))
  if (keyFile) return keyFile.replace(/\.txt$/, "")
  throw new Error("No IndexNow key found")
}

async function main() {
  const key = resolveKey()
  const keyLocation = `${BASE_URL}/${key}.txt`
  const urlList = []
  for (const lang of resolveSupportedLanguages()) {
    for (const path of INDEXABLE_PATHS) {
      urlList.push(`${BASE_URL}/${lang}${path}`)
    }
  }

  const body = {
    host: "www.berlin-2026.de",
    key,
    keyLocation,
    urlList,
  }

  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  })

  const text = await res.text()
  if (!res.ok) {
    console.error(`IndexNow failed: ${res.status} ${text}`)
    process.exit(1)
  }
  console.log(`IndexNow accepted ${urlList.length} URLs (${res.status})`)
  if (text) console.log(text)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
