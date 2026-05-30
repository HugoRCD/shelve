#!/usr/bin/env node
const keepAlive = process.argv.includes('--keep-alive')

const interesting = Object.entries(process.env)
  .filter(([key]) => key.startsWith('SHELVE_') || key.startsWith('PLAYGROUND_') || /^(API_|DATABASE_|STRIPE_|HELLO|FOO|BAR|BAZ)/.test(key))
  .sort(([a], [b]) => a.localeCompare(b))

console.log('--- shelve playground/run ---')
console.log(`pid:       ${process.pid}`)
console.log(`cwd:       ${process.cwd()}`)
console.log(`argv:      ${JSON.stringify(process.argv.slice(2))}`)
console.log(`node:      ${process.version}`)
console.log(`secrets:   ${interesting.length} value(s) injected`)
for (const [key, value] of interesting) {
  const masked = value && value.length > 6 ? `${value.slice(0, 2)}…${value.slice(-2)} (${value.length} chars)` : value
  console.log(`  ${key} = ${masked}`)
}
console.log('---')

if (!keepAlive) process.exit(0)

console.log('keep-alive mode — Ctrl-C to stop. SIGHUP also handled.')
process.on('SIGHUP', () => console.log('[playground] received SIGHUP'))
process.on('SIGINT', () => { console.log('[playground] received SIGINT'); process.exit(130) })
process.on('SIGTERM', () => { console.log('[playground] received SIGTERM'); process.exit(143) })
setInterval(() => {}, 1 << 30)
