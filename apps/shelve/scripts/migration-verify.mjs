import { spawnSync } from 'node:child_process'

const args = process.argv.slice(2)

const hasVerifyOnly = args.some((arg) => arg === '--verify-only' || arg.startsWith('--verify-only='))
const forwardedArgs = hasVerifyOnly ? args : ['--verify-only', ...args]

const child = spawnSync(process.execPath, ['scripts/migration-seed.mjs', ...forwardedArgs], {
  stdio: 'inherit',
})

if (typeof child.status === 'number') {
  process.exit(child.status)
}

process.exit(1)
