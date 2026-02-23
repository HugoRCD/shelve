import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'

const args = parseArgs(process.argv.slice(2))
const phase = Number(requireArg(args, 'phase'))
const out = requireArg(args, 'out')

if (!Number.isInteger(phase) || phase < 0 || phase > 6) {
  throw new Error('--phase must be an integer between 0 and 6')
}

const result = {
  phase,
  checkedAt: new Date().toISOString(),
  pass: true,
  checks: [],
  errors: [],
}

try {
  if (phase === 0) await runPhase0(result)
  if (phase === 1) await runPhase1(result)
  if (phase === 2) await runPhase2(result)
  if (phase === 3) await runPhase3(result)
  if (phase === 4) await runPhase4(result)
  if (phase === 5) await runPhase5(result)
  if (phase === 6) await runPhase6(result)

  result.pass = result.errors.length === 0 && result.checks.every(check => check.pass)

  await mkdir(dirname(out), { recursive: true })
  await writeFile(out, JSON.stringify(result, null, 2), 'utf8')
  console.log(JSON.stringify(result, null, 2))

  if (!result.pass) process.exit(1)
} catch (error) {
  result.pass = false
  result.errors.push(error instanceof Error ? error.message : String(error))
  await mkdir(dirname(out), { recursive: true })
  await writeFile(out, JSON.stringify(result, null, 2), 'utf8')
  console.log(JSON.stringify(result, null, 2))
  process.exit(1)
}

async function runPhase0(result) {
  assertBool(result, 'syntaxCheck', args['syntax-ok'])
  assertBool(result, 'typecheck', args['typecheck-ok'])
  assertBool(result, 'dbCheckPre', args['db-check-ok'])
  assertBool(result, 'rollbackCommandAvailable', args['rollback-ok'])
  assertBool(result, 'dbResetDryRun', args['db-reset-dry-ok'])
  assertBool(result, 'dbResetExecuted', args['db-reset-ok'])
}

async function runPhase1(result) {
  const pre = JSON.parse(await readFile(requireArg(args, 'pre'), 'utf8'))
  const seed = JSON.parse(await readFile(requireArg(args, 'seed'), 'utf8'))
  const cli = JSON.parse(await readFile(requireArg(args, 'cli-main'), 'utf8'))

  addCheck(result, 'preSnapshotExists', !!pre && typeof pre === 'object', 'Missing/invalid pre snapshot')
  addCheck(result, 'seedCompleted', seed?.checks?.seedCompleted === true, 'seedCompleted=false')
  addCheck(result, 'profileCountsMatch', seed?.checks?.profileCountsMatch === true, 'profile counts mismatch')
  addCheck(result, 'legacyCliPass', cli?.pass === true, 'legacy CLI pre-check failed')
}

async function runPhase2(result) {
  assertBool(result, 'compatFlagPresent', args['compat-flag-ok'])
  assertBool(result, 'deploymentReady', args['deployment-ready'])
  assertBool(result, 'routesHealthy', args['routes-ok'])
  assertBool(result, 'migrationLogsHealthy', args['migration-logs-ok'])
}

async function runPhase3(result) {
  const post = JSON.parse(await readFile(requireArg(args, 'post'), 'utf8'))
  const compare = JSON.parse(await readFile(requireArg(args, 'compare'), 'utf8'))

  addCheck(result, 'postSnapshotExists', !!post && typeof post === 'object', 'Missing/invalid post snapshot')
  addCheck(result, 'compareVerdict', compare?.verdict === 'PASS' || compare?.verdict === 'PASS WITH FRICTIONS', `Unexpected compare verdict: ${compare?.verdict || 'unknown'}`)
}

async function runPhase4(result) {
  const verify = JSON.parse(await readFile(requireArg(args, 'verify'), 'utf8'))
  const cliMain = JSON.parse(await readFile(requireArg(args, 'cli-main'), 'utf8'))
  const cliBetter = JSON.parse(await readFile(requireArg(args, 'cli-better'), 'utf8'))

  addCheck(result, 'verifyCompleted', verify?.checks?.verifyCompleted === true, 'verifyCompleted=false')
  addCheck(result, 'legacyCliPassPost', cliMain?.pass === true, 'legacy CLI post-check failed')
  addCheck(result, 'betterCliPassPost', cliBetter?.pass === true, 'better CLI post-check failed')
}

async function runPhase5(result) {
  const summary = JSON.parse(await readFile(requireArg(args, 'summary'), 'utf8'))
  addCheck(result, 'soakIterationsMatch', Number(summary?.iterationsExpected) === Number(summary?.iterationsObserved), 'soak iteration count mismatch')
  addCheck(result, 'soakVerifyPass', summary?.verifyFailures === 0, `verify failures=${summary?.verifyFailures}`)
  addCheck(result, 'soakCliPass', summary?.cliFailures === 0, `cli failures=${summary?.cliFailures}`)
}

async function runPhase6(result) {
  assertBool(result, 'rollbackExecuted', args['rollback-ok'])
}

function assertBool(result, name, raw) {
  const pass = parseBool(raw)
  addCheck(result, name, pass, `${name}=false`)
}

function addCheck(result, name, pass, message) {
  result.checks.push({ name, pass: Boolean(pass) })
  if (!pass) result.errors.push(message)
}

function parseBool(raw) {
  return String(raw || '').toLowerCase() === 'true'
}

function parseArgs(argv) {
  const parsed = {}
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--') continue
    if (!arg.startsWith('--')) continue

    const stripped = arg.slice(2)
    const eqIndex = stripped.indexOf('=')
    if (eqIndex !== -1) {
      const key = stripped.slice(0, eqIndex)
      const value = stripped.slice(eqIndex + 1)
      parsed[key] = value === '' ? 'true' : value
      continue
    }

    const key = stripped
    const next = argv[i + 1]
    if (next && !next.startsWith('--')) {
      parsed[key] = next
      i++
    } else {
      parsed[key] = 'true'
    }
  }
  return parsed
}

function requireArg(parsed, key) {
  const value = parsed[key]
  if (!value) throw new Error(`--${key} is required`)
  return value
}
