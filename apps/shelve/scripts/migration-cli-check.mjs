import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const args = parseArgs(process.argv.slice(2))
const baseUrl = requireArg(args, 'base-url')
const seedInput = requireArg(args, 'seed-input')
const cliRoot = resolve(requireArg(args, 'cli-root'))
const mode = normalizeMode(requireArg(args, 'mode'))
const outputPath = requireArg(args, 'out')
const maxTokens = Number(args['max-tokens'] || 0)

const seed = JSON.parse(await readFile(seedInput, 'utf8'))
const primaryTeamSlug = seed.primaryTeamSlug || seed.teams?.[0]?.slug
if (!primaryTeamSlug) {
  throw new Error('Seed data missing primary team slug')
}

const project = pickProject(seed.projects, primaryTeamSlug)
const environment = pickEnvironment(seed.environments, primaryTeamSlug)
if (!project?.projectName) throw new Error('Seed data missing project for CLI check')
if (!environment?.name) throw new Error('Seed data missing environment for CLI check')

const tokens = Array.isArray(seed.tokens) ? seed.tokens : []
if (!tokens.length) {
  throw new Error('Seed data missing tokens for CLI check')
}

const selectedTokens = maxTokens > 0 ? tokens.slice(0, maxTokens) : tokens

run('pnpm', ['build'], { cwd: cliRoot })

const cliEntry = resolve(cliRoot, 'dist', 'index.mjs')
const checks = []
let failures = 0

for (let index = 0; index < selectedTokens.length; index++) {
  const tokenMeta = selectedTokens[index]
  const workspace = await mkdtemp(join(tmpdir(), `shelve-${mode}-cli-${index + 1}-`))
  const fakeHome = await mkdtemp(join(tmpdir(), `shelve-${mode}-home-${index + 1}-`))

  const env = {
    ...process.env,
    HOME: fakeHome,
    SHELVE_URL: baseUrl,
    SHELVE_TOKEN: String(tokenMeta.token || ''),
    SHELVE_TEAM_SLUG: primaryTeamSlug,
    SHELVE_PROJECT: project.projectName,
    SHELVE_DEFAULT_ENV: environment.name,
  }

  const pull = run('node', [cliEntry, 'pull', '--env', environment.name], {
    cwd: workspace,
    env,
    allowFailure: true,
  })

  const check = {
    tokenId: tokenMeta.id,
    tokenName: tokenMeta.name,
    ownerEmail: tokenMeta.ownerEmail || null,
    ownerType: tokenMeta.ownerType || null,
    pull: {
      ok: pull.status === 0,
      status: pull.status,
      stdoutTail: tail(pull.stdout),
      stderrTail: tail(pull.stderr),
    },
    workspace,
  }

  if (!check.pull.ok) failures++
  checks.push(check)
}

const report = {
  checkedAt: new Date().toISOString(),
  mode,
  baseUrl,
  cliRoot,
  seedInput,
  teamSlug: primaryTeamSlug,
  project: project.projectName,
  environment: environment.name,
  totalTokens: selectedTokens.length,
  failures,
  pass: failures === 0,
  checks,
}

await mkdir(dirname(outputPath), { recursive: true })
await writeFile(outputPath, JSON.stringify(report, null, 2), 'utf8')
console.log(JSON.stringify(report, null, 2))

if (!report.pass) process.exit(1)

function pickProject(projects, primaryTeamSlug) {
  if (!Array.isArray(projects)) return null
  return projects.find(project => project.teamSlug === primaryTeamSlug) || projects[0] || null
}

function pickEnvironment(environments, primaryTeamSlug) {
  if (!Array.isArray(environments)) return null
  return environments.find(environment => environment.teamSlug === primaryTeamSlug) || environments[0] || null
}

function normalizeMode(raw) {
  const mode = String(raw || '').toLowerCase()
  if (!['legacy', 'better'].includes(mode)) {
    throw new Error('--mode must be one of: legacy, better')
  }
  return mode
}

function run(cmd, argv, { cwd, env, allowFailure = false }) {
  const result = spawnSync(cmd, argv, {
    cwd,
    env: env || process.env,
    encoding: 'utf8',
    stdio: ['inherit', 'pipe', 'pipe'],
  })

  if (result.stdout) process.stdout.write(result.stdout)
  if (result.stderr) process.stderr.write(result.stderr)

  if (!allowFailure && result.status !== 0) {
    throw new Error(`Command failed (${cmd} ${argv.join(' ')})`)
  }

  return {
    status: result.status || 0,
    stdout: result.stdout || '',
    stderr: result.stderr || '',
  }
}

function tail(text, limit = 800) {
  const value = String(text || '')
  return value.length <= limit ? value : value.slice(value.length - limit)
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
