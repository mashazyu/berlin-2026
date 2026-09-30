/**
 * Fail if any supported locale is missing keys present in EN, or has empty strings
 * where EN has non-empty strings.
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const LOCALES_DIR = path.join(ROOT, "locales")
const BASE = "en"

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

/** Privacy / Impressum pages exist only in EN + DE (other locales redirect). */
const LEGAL_ONLY_LANGS = new Set(["en", "de"])

function readLocale(lang) {
  const filePath = path.join(LOCALES_DIR, `${lang}.json`)
  return JSON.parse(fs.readFileSync(filePath, "utf8"))
}

function stripLegalOnlyKeys(locale) {
  const clone = structuredClone(locale)
  delete clone.privacy
  delete clone.impressum
  if (clone.metadata && typeof clone.metadata === "object") {
    delete clone.metadata.privacyTitle
    delete clone.metadata.privacyDescription
    delete clone.metadata.impressumTitle
    delete clone.metadata.impressumDescription
  }
  return clone
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value)
}

function collectIssues(baseValue, candidateValue, currentPath, issues) {
  if (Array.isArray(baseValue)) {
    if (!Array.isArray(candidateValue)) {
      issues.push(`Missing or invalid array at "${currentPath}"`)
      return
    }
    const baseIsStringArray =
      baseValue.length > 0 && baseValue.every((item) => typeof item === "string")
    if (baseIsStringArray) {
      if (candidateValue.length === 0) {
        issues.push(`Empty string array at "${currentPath}"`)
        return
      }
      for (let i = 0; i < candidateValue.length; i++) {
        if (typeof candidateValue[i] !== "string" || !candidateValue[i].trim()) {
          issues.push(`Missing or empty string at "${currentPath}[${i}]"`)
        }
      }
      return
    }
    if (candidateValue.length < baseValue.length) {
      issues.push(
        `Array at "${currentPath}" shorter than EN (${candidateValue.length} < ${baseValue.length})`,
      )
    }
    for (let i = 0; i < baseValue.length; i++) {
      const next = `${currentPath}[${i}]`
      if (candidateValue[i] === undefined) {
        issues.push(`Missing array item at "${next}"`)
        continue
      }
      collectIssues(baseValue[i], candidateValue[i], next, issues)
    }
    return
  }

  if (isObject(baseValue)) {
    if (!isObject(candidateValue)) {
      issues.push(`Missing or invalid object at "${currentPath}"`)
      return
    }
    for (const [key, nested] of Object.entries(baseValue)) {
      const next = currentPath ? `${currentPath}.${key}` : key
      if (!(key in candidateValue)) {
        issues.push(`Missing key "${next}"`)
        continue
      }
      collectIssues(nested, candidateValue[key], next, issues)
    }
    return
  }

  if (typeof baseValue === "string") {
    if (baseValue.trim().length === 0) return
    if (typeof candidateValue !== "string" || candidateValue.trim().length === 0) {
      issues.push(`Missing or empty string at "${currentPath}"`)
    }
  }
}

function main() {
  const baseFull = readLocale(BASE)
  const baseLegal = stripLegalOnlyKeys(baseFull)
  let failed = false

  for (const lang of LOCALES) {
    if (lang === BASE) continue
    const base = LEGAL_ONLY_LANGS.has(lang) ? baseFull : baseLegal
    const candidate = readLocale(lang)
    const issues = []
    collectIssues(base, candidate, "", issues)
    if (issues.length) {
      failed = true
      console.error(`\n[${lang}] ${issues.length} issue(s):`)
      for (const issue of issues.slice(0, 40)) console.error(`  - ${issue}`)
      if (issues.length > 40) {
        console.error(`  … and ${issues.length - 40} more`)
      }
    } else {
      console.log(`[${lang}] ok`)
    }
  }

  if (failed) {
    console.error("\nTranslation completeness check failed.")
    process.exit(1)
  }
  console.log("\nAll locales complete relative to EN.")
}

main()
