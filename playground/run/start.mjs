#!/usr/bin/env node
import { spawn } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import http from 'node:http'
import os from 'node:os'

const here = dirname(fileURLToPath(import.meta.url))
const seed = JSON.parse(readFileSync(resolve(here, 'seed.json'), 'utf8'))

const HOST = process.env.PLAYGROUND_HOST || '127.0.0.1'
const PORT = Number(process.env.PLAYGROUND_PORT || 7777)
const API_URL = `http://${HOST}:${PORT}`

const rawArgs = process.argv.slice(2)
const firstDashDash = rawArgs.indexOf('--')
const args = firstDashDash >= 0
  ? [...rawArgs.slice(0, firstDashDash), ...rawArgs.slice(firstDashDash + 1)]
  : rawArgs
const cliArgs = args.length === 0 ? ['run', 'dev'] : args

const cliBin = resolve(here, '../../packages/cli/dist/index.mjs')

console.log(`[playground] starting fake API on ${API_URL}`)
console.log(`[playground] CLI args: ${JSON.stringify(cliArgs)}`)

const isWindows = process.platform === 'win32'

let cli = null

const serverProc = spawn(process.execPath, [resolve(here, 'server.mjs')], {
  env: { ...process.env, PLAYGROUND_HOST: HOST, PLAYGROUND_PORT: String(PORT) },
  stdio: ['ignore', 'inherit', 'inherit'],
  detached: !isWindows,
})

let shuttingDown = false
const killAll = (sig = 'SIGTERM') => {
  if (shuttingDown) return
  shuttingDown = true
  try {
    if (cli && cli.pid && !isWindows) process.kill(-cli.pid, sig)
    else if (cli) cli.kill(sig)
  } catch { /* ignore */ }
  try {
    if (serverProc && serverProc.pid && !isWindows) process.kill(-serverProc.pid, sig)
    else if (serverProc && !serverProc.killed) serverProc.kill(sig)
  } catch { /* ignore */ }
}

const onSignal = (sig, exitCode) => {
  killAll(sig)
  setTimeout(() => process.exit(exitCode), 300).unref()
}
process.on('SIGINT', () => onSignal('SIGINT', 130))
process.on('SIGTERM', () => onSignal('SIGTERM', 143))
process.on('exit', () => killAll('SIGTERM'))

serverProc.on('error', (err) => {
  console.error(`[playground] fake API failed to start: ${err.message}`)
  process.exit(1)
})

async function waitForHealth(timeoutMs = 5000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const ok = await new Promise((resolveProbe) => {
      const req = http.get(`${API_URL}/health`, (res) => {
        res.resume()
        resolveProbe(res.statusCode === 200)
      })
      req.on('error', () => resolveProbe(false))
      req.setTimeout(250, () => { req.destroy(); resolveProbe(false) })
    })
    if (ok) return true
    await new Promise((r) => setTimeout(r, 100))
  }
  return false
}

const ready = await waitForHealth()
if (!ready) {
  console.error('[playground] fake API never became healthy')
  killAll('SIGTERM')
  process.exit(1)
}

const env = {
  ...process.env,
  SHELVE_URL: API_URL,
  SHELVE_TOKEN: seed.token,
  SHELVE_TEAM_SLUG: seed.team.slug,
  SHELVE_PROJECT: seed.project.name,
  SHELVE_DEFAULT_ENV: 'development',
}

cli = spawn(process.execPath, [cliBin, ...cliArgs], {
  cwd: here,
  env,
  stdio: 'inherit',
  detached: !isWindows,
})

cli.on('exit', (code, signal) => {
  killAll('SIGTERM')
  if (signal) {
    const num = os.constants.signals[signal] ?? 0
    setTimeout(() => process.exit(128 + num), 200).unref()
    return
  }
  setTimeout(() => process.exit(code ?? 0), 200).unref()
})

cli.on('error', (err) => {
  console.error(`[playground] CLI failed to spawn: ${err.message}`)
  killAll('SIGTERM')
  process.exit(1)
})
