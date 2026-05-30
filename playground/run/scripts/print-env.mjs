#!/usr/bin/env node
const keepAlive = process.argv.includes('--keep-alive')

const DEFAULT_SHOW = /^(SHELVE_|PLAYGROUND_|API_|DATABASE_|STRIPE_|FRESH_|HELLO|FOO|BAR|BAZ|NEW_)/

function getShowPattern() {
  const raw = process.env.PLAYGROUND_SHOW_ENV_PATTERN
  if (!raw) return DEFAULT_SHOW
  try {
    return new RegExp(raw)
  } catch {
    console.error(`Invalid PLAYGROUND_SHOW_ENV_PATTERN: ${raw}`)
    process.exit(1)
  }
}

const SHOW = getShowPattern()
const interesting = Object.entries(process.env)
  .filter(([key]) => SHOW.test(key))
  .sort(([a], [b]) => a.localeCompare(b))

const ts = new Date().toISOString().replace('T', ' ').slice(0, 19)

console.log(`──────── shelve playground/run @ ${ts} ────────`)
console.log(`pid:       ${process.pid}`)
console.log(`cwd:       ${process.cwd()}`)
console.log(`argv:      ${JSON.stringify(process.argv.slice(2))}`)
console.log(`node:      ${process.version}`)
console.log(`secrets:   ${interesting.length} value(s) injected`)
for (const [key, value] of interesting) {
  const masked = value && value.length > 6 ? `${value.slice(0, 2)}…${value.slice(-2)} (${value.length} chars)` : value
  console.log(`  ${key} = ${masked}`)
}
console.log('──────────────────────────────────────────────────')

if (!keepAlive) process.exit(0)

console.log('keep-alive — Ctrl-C to stop. SIGHUP re-prints the env without restarting.')

function rePrint(why) {
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19)
  console.log(`\n[${now}] ${why} — current env:`)
  for (const [key, value] of interesting) {
    const masked = value && value.length > 6 ? `${value.slice(0, 2)}…${value.slice(-2)} (${value.length} chars)` : value
    console.log(`  ${key} = ${masked}`)
  }
}

process.on('SIGHUP', () => rePrint('SIGHUP'))
process.on('SIGINT', () => { console.log(`[${new Date().toISOString().slice(11, 19)}] SIGINT — bye`); process.exit(130) })
process.on('SIGTERM', () => { console.log(`[${new Date().toISOString().slice(11, 19)}] SIGTERM — bye`); process.exit(143) })
setInterval(() => {}, 1 << 30)
