import { readFile } from 'node:fs/promises'

const args = parseArgs(process.argv.slice(2))
const prePath = requireArg(args, 'pre')
const postPath = requireArg(args, 'post')
const runId = args['run-id'] || null

const pre = JSON.parse(await readFile(prePath, 'utf8'))
const post = JSON.parse(await readFile(postPath, 'utf8'))

const errors = []
const warnings = []

compareCount('teams')
compareCount('projects')
compareCount('environments')
compareCount('variables')
compareCount('variable_values')
compareCount('members')
compareCount('tokens')
compareCount('invitations')
compareCount('github_app')
compareCount('session')

if (isNumber(pre.counts.users) && isNumber(post.counts.user)) {
  if (post.counts.user < pre.counts.users) {
    errors.push(`User rows decreased after migration (${pre.counts.users} -> ${post.counts.user})`)
  }
}

if (isNumber(post.counts.users) && post.counts.users > 0) {
  errors.push(`Legacy table "users" still has rows post migration (${post.counts.users})`)
}

if (pre.runScopedCounts && post.runScopedCounts) {
  compareRunScoped('teamsBySlug')
  compareRunScoped('projectsByName')
  compareRunScoped('variablesByKey')
  compareRunScoped('tokensByName')
  compareRunScoped('invitationsByEmail')
  compareRunScoped('environmentsByName')
}

for (const [name, value] of Object.entries(post.orphans || {})) {
  if (!isNumber(value)) continue
  if (value > 0) errors.push(`Post-migration orphan check failed: ${name}=${value}`)
}

const verdict = errors.length
  ? 'FAIL'
  : warnings.length
    ? 'PASS WITH FRICTIONS'
    : 'PASS'

const result = {
  verdict,
  runId: runId || pre.runId || post.runId || null,
  comparedAt: new Date().toISOString(),
  prePath,
  postPath,
  errors,
  warnings,
}

console.log(JSON.stringify(result, null, 2))

if (errors.length) process.exit(1)

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

function requireArg(args, key) {
  const value = args[key]
  if (!value) throw new Error(`--${key} is required`)
  return value
}

function isNumber(value) {
  return typeof value === 'number' && Number.isFinite(value)
}

function compareCount(key) {
  const before = pre.counts?.[key]
  const after = post.counts?.[key]
  if (!isNumber(before) || !isNumber(after)) return
  if (after < before) {
    errors.push(`Count decreased for ${key} (${before} -> ${after})`)
  } else if (after > before) {
    warnings.push(`Count increased for ${key} (${before} -> ${after})`)
  }
}

function compareRunScoped(key) {
  const before = pre.runScopedCounts?.[key]
  const after = post.runScopedCounts?.[key]
  if (!isNumber(before) || !isNumber(after)) return
  if (after < before) {
    errors.push(`Run-scoped count decreased for ${key} (${before} -> ${after})`)
  } else if (after > before) {
    warnings.push(`Run-scoped count increased for ${key} (${before} -> ${after})`)
  }
}
