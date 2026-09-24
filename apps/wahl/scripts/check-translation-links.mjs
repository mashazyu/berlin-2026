/**
 * Fail if markdown links in locale JSON point at unknown in-app routes.
 * External URLs (http/https/mailto) are skipped.
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const APP_DIR = path.join(ROOT, "app")
const LOCALES_DIR = path.join(ROOT, "locales")

const LOCALES = [
  "en",
  "de",
  "tr",
  "ku",
  "vi",
  "pl",
  "ru",
  "uk",
  "ar",
  "es",
  "it",
]

function walkPageFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) walkPageFiles(fullPath, out)
    else if (entry.isFile() && entry.name === "page.tsx") out.push(fullPath)
  }
  return out
}

function buildKnownRoutes() {
  const routes = new Set(["/", "/{lang}"])
  for (const filePath of walkPageFiles(APP_DIR)) {
    const relative = filePath
      .replace(APP_DIR, "")
      .replace(/\\/g, "/")
      .replace(/\/page\.tsx$/, "")
    if (!relative) continue
    routes.add(relative.replace("/[lang]", "/{lang}") || "/{lang}")
  }
  return routes
}

function extractMarkdownLinks(value, out = []) {
  if (typeof value === "string") {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
    let match
    while ((match = linkRegex.exec(value)) !== null) {
      out.push(match[2])
    }
    return out
  }
  if (Array.isArray(value)) {
    for (const item of value) extractMarkdownLinks(item, out)
    return out
  }
  if (value && typeof value === "object") {
    for (const item of Object.values(value)) extractMarkdownLinks(item, out)
  }
  return out
}

function normalizeLinkForRouteCheck(link, lang) {
  const withoutHash = link.split("#")[0].split("?")[0]
  const resolved = withoutHash.replaceAll("{lang}", lang)
  if (resolved === `/${lang}` || resolved === `/${lang}/`) return "/{lang}"
  if (resolved.startsWith(`/${lang}/`)) {
    return `/{lang}${resolved.slice(lang.length + 1)}`
  }
  return resolved
}

function publicAssetExists(href) {
  const withoutHash = href.split("#")[0].split("?")[0]
  if (!withoutHash.startsWith("/")) return false
  const rel = withoutHash.replace(/^\//, "")
  return fs.existsSync(path.join(ROOT, "public", rel))
}

function main() {
  const knownRoutes = buildKnownRoutes()
  const broken = []

  for (const lang of LOCALES) {
    const locale = JSON.parse(
      fs.readFileSync(path.join(LOCALES_DIR, `${lang}.json`), "utf8"),
    )
    for (const href of extractMarkdownLinks(locale)) {
      if (!href.startsWith("/")) continue
      if (publicAssetExists(href)) continue
      const normalized = normalizeLinkForRouteCheck(href, lang)
      if (!knownRoutes.has(normalized)) {
        broken.push({ lang, href, normalized })
      }
    }
  }

  if (broken.length) {
    console.error(`Broken local translation links (${broken.length}):`)
    for (const item of broken) {
      console.error(
        `  [${item.lang}] ${item.href} → checked as ${item.normalized}`,
      )
    }
    process.exit(1)
  }

  console.log(`OK — checked locales against ${knownRoutes.size} known routes.`)
}

main()
