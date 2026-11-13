import { createServer } from "node:net"
import { spawn } from "node:child_process"
import { createRequire } from "node:module"
import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

/** Wahl-Kompass (wahl.kompass.berlin) — local start always uses apps/wahl. */
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const APP_DIR = path.join(ROOT, "apps", "wahl")
const START_PORT = Number.parseInt(process.env.PORT || "3000", 10)

function assertProductionBuild(appDir) {
  const manifestPath = path.join(appDir, ".next", "routes-manifest.json")
  if (!existsSync(manifestPath)) {
    console.error(
      `No production build found (${path.relative(ROOT, manifestPath)} missing).\n` +
        "Run: pnpm --filter @kompass/wahl build"
    )
    process.exit(1)
  }
  try {
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"))
    if (!Array.isArray(manifest.dataRoutes)) {
      console.error(
        "Production build looks incomplete (routesManifest.dataRoutes missing).\n" +
          "Dev/Turbopack output cannot be used with next start.\n" +
          "Run: pnpm --filter @kompass/wahl build"
      )
      process.exit(1)
    }
  } catch {
    console.error(
      `Could not read ${path.relative(ROOT, manifestPath)}.\n` +
        "Run: pnpm --filter @kompass/wahl build"
    )
    process.exit(1)
  }
}

function isPortFree(port) {
  return new Promise((resolve) => {
    const server = createServer()
    server.unref()
    server.once("error", () => resolve(false))
    server.once("listening", () => {
      server.close(() => resolve(true))
    })
    server.listen(port, "0.0.0.0")
  })
}

async function findAvailablePort(start) {
  let port = start
  while (port < 65535) {
    if (await isPortFree(port)) return port
    port += 1
  }
  throw new Error(`No free port found starting from ${start}`)
}

assertProductionBuild(APP_DIR)

const port = await findAvailablePort(
  Number.isFinite(START_PORT) && START_PORT > 0 ? START_PORT : 3000
)

if (port !== START_PORT) {
  console.log(`Port ${START_PORT} is in use, using ${port}`)
}

console.log(`Starting @kompass/wahl (apps/wahl) on http://localhost:${port}`)

const require = createRequire(path.join(APP_DIR, "package.json"))
const nextBin = path.join(
  path.dirname(require.resolve("next/package.json")),
  "dist/bin/next"
)

const child = spawn(
  process.execPath,
  [nextBin, "start", "--port", String(port)],
  {
    cwd: APP_DIR,
    stdio: "inherit",
    env: { ...process.env, PORT: String(port) },
  }
)

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal)
  process.exit(code ?? 1)
})
