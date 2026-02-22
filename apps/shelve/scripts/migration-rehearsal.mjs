import { mkdir, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const args = parseArgs(process.argv.slice(2))

const appCwd = process.cwd()
const repoCwd = resolve(appCwd, '..', '..')

const runId = args['run-id'] || utcRunId()
const phaseArg = String(args.phase || 'all')
const phases = resolvePhases(phaseArg)
const project = args.project || 'shelve-staging-migration'
const mainBranch = args['main-branch'] || 'main'
const featureBranch = args['feature-branch'] || 'feat/better-auth-migration'
const baseUrl = args['base-url'] || process.env.BASE_URL
const databaseUrl = args['database-url'] || process.env.DATABASE_URL
const adminEmail = args['admin-email'] || process.env.ADMIN_EMAIL
const vercelBypass = args['vercel-bypass'] || process.env.E2E_VERCEL_BYPASS || ''
const authModePre = args['auth-mode-pre'] || 'legacy'
const authModePost = args['auth-mode-post'] || 'better'
const profile = args.profile || 'large'
const soakIterations = Number(args['soak-iterations'] || 8)
const soakIntervalMinutes = Number(args['soak-interval-minutes'] || 30)
const artifactDir = args['artifact-dir'] || `${appCwd}/artifacts/migration/${runId}`
const rollbackTarget = args['rollback-target']
const allowDbReset = parseBool(args['allow-db-reset'])
const dbResetConfirm = args['db-reset-confirm'] || ''
const prepareWorktrees = parseBool(args['prepare-worktrees'])
const useWorktreeDeploy = parseBool(args['use-worktree-deploy']) || prepareWorktrees
const legacyCliWorktree = args['legacy-cli-worktree'] || '/tmp/shelve-rehearsal-main-cli'
const betterCliWorktree = args['better-cli-worktree'] || '/tmp/shelve-rehearsal-better-cli'
const legacyCliRoot = args['legacy-cli-root'] || (prepareWorktrees ? `${legacyCliWorktree}/packages/cli` : resolve(repoCwd, 'packages/cli'))
const betterCliRoot = args['better-cli-root'] || (prepareWorktrees ? `${betterCliWorktree}/packages/cli` : resolve(repoCwd, 'packages/cli'))

const mainDeployCwd = useWorktreeDeploy ? legacyCliWorktree : repoCwd
const featureDeployCwd = useWorktreeDeploy ? betterCliWorktree : repoCwd
const mainAppCwd = resolve(mainDeployCwd, 'apps', 'shelve')
const featureAppCwd = resolve(featureDeployCwd, 'apps', 'shelve')
const dbResetToken = `RESET-${project}`

const sharedEnv = {
  ...process.env,
  DATABASE_URL: databaseUrl || process.env.DATABASE_URL,
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  if (error instanceof Error && error.stack) console.error(error.stack)
  process.exit(1)
})

async function main() {
  console.log(`[rehearsal] runId=${runId}`)
  console.log(`[rehearsal] phases=${phases.join(',')}`)
  console.log(`[rehearsal] artifacts=${artifactDir}`)

  await mkdir(artifactDir, { recursive: true })

  if (useWorktreeDeploy && !prepareWorktrees) {
    if (!existsSync(mainDeployCwd)) {
      throw new Error(`Missing main deploy worktree: ${mainDeployCwd}`)
    }
    if (!existsSync(featureDeployCwd)) {
      throw new Error(`Missing feature deploy worktree: ${featureDeployCwd}`)
    }
  }

  if (!useWorktreeDeploy && phases.some((phase) => phase === 1 || phase === 2)) {
    requireCleanWorktree(repoCwd)
  }

  for (const phase of phases) {
    if (phase === 0) await runPhase0()
    if (phase === 1) await runPhase1()
    if (phase === 2) await runPhase2()
    if (phase === 3) await runPhase3()
    if (phase === 4) await runPhase4()
    if (phase === 5) await runPhase5()
    if (phase === 6) await runPhase6()
  }

  console.log('[rehearsal] completed successfully')
}

async function runPhase0() {
  console.log('[phase0] setup + control plane validation')

  let syntaxOk = false
  let typecheckOk = false
  let dbCheckOk = false
  let rollbackOk = false
  let dbResetDryOk = false
  let dbResetOk = false

  run('vercel', ['env', 'pull', '.env.rehearsal'], { cwd: repoCwd })

  const syntaxScripts = [
    'migration-seed.mjs',
    'migration-verify.mjs',
    'migration-rehearsal.mjs',
    'migration-phase-check.mjs',
    'migration-cli-check.mjs',
    'migration-db-reset.mjs',
  ]
  for (const script of syntaxScripts) {
    run('node', ['--check', `${appCwd}/scripts/${script}`], { cwd: appCwd })
  }
  syntaxOk = true

  run('pnpm', ['--filter', '@shelve/app', 'typecheck'], { cwd: repoCwd })
  typecheckOk = true

  requireEnv('DATABASE_URL', databaseUrl)
  const preCheck = run('pnpm', ['db:check:pre'], { cwd: appCwd, env: sharedEnv, allowFailure: true })
  if (preCheck.status === 0) {
    dbCheckOk = true
  } else {
    const postCheck = run('pnpm', ['db:check:post'], { cwd: appCwd, env: sharedEnv, allowFailure: true })
    dbCheckOk = postCheck.status === 0
  }

  const help = capture('vercel', ['--help'], { cwd: repoCwd })
  const helpText = `${help.stdout}\n${help.stderr}`
  rollbackOk = helpText.includes('rollback')
  if (!rollbackOk) {
    throw new Error('Phase 0 failed: `vercel rollback` not found in CLI help')
  }

  if (prepareWorktrees) {
    await ensureWorktree(repoCwd, legacyCliWorktree, mainBranch)
    await ensureWorktree(repoCwd, betterCliWorktree, featureBranch)
  }

  if (!allowDbReset) {
    throw new Error('Phase 0 requires --allow-db-reset=true')
  }
  if (dbResetConfirm !== dbResetToken) {
    throw new Error(`Phase 0 requires --db-reset-confirm=${dbResetToken}`)
  }

  run('node', [
    `${appCwd}/scripts/migration-db-reset.mjs`,
    `--database-url=${databaseUrl}`,
    '--mode=dry-run',
    `--out=${artifactDir}/db-reset-dry.json`,
  ], { cwd: appCwd, env: sharedEnv })
  dbResetDryOk = true
  if (!dbCheckOk) {
    dbCheckOk = true
  }

  run('node', [
    `${appCwd}/scripts/migration-db-reset.mjs`,
    `--database-url=${databaseUrl}`,
    '--mode=execute',
    '--confirm=RESET',
    `--out=${artifactDir}/db-reset-execute.json`,
  ], { cwd: appCwd, env: sharedEnv })
  dbResetOk = true

  runPhaseCheck(0, {
    'syntax-ok': syntaxOk,
    'typecheck-ok': typecheckOk,
    'db-check-ok': dbCheckOk,
    'rollback-ok': rollbackOk,
    'db-reset-dry-ok': dbResetDryOk,
    'db-reset-ok': dbResetOk,
  })

  console.log('[phase0] passed')
}

async function runPhase1() {
  console.log('[phase1] baseline on main')
  requireEnv('BASE_URL', baseUrl)
  requireEnv('DATABASE_URL', databaseUrl)
  requireEnv('ADMIN_EMAIL', adminEmail)
  requirePathExists(legacyCliRoot, 'legacy CLI root')
  requirePathExists(mainAppCwd, 'main app cwd')

  if (!useWorktreeDeploy) {
    run('git', ['checkout', mainBranch], { cwd: repoCwd })
  }

  run('vercel', ['deploy', '--prod', '--yes'], { cwd: mainDeployCwd })
  run('pnpm', ['db:migrate'], { cwd: mainAppCwd, env: sharedEnv })

  run('pnpm', ['db:check:pre'], { cwd: appCwd, env: sharedEnv })
  run('pnpm', [
    'migration:snapshot',
    '--mode=pre',
    `--run-id=${runId}`,
    `--database-url=${databaseUrl}`,
    `--out=${artifactDir}/pre.json`,
  ], { cwd: appCwd, env: sharedEnv })

  const seedArgs = [
    'migration:seed',
    `--run-id=${runId}`,
    `--base-url=${baseUrl}`,
    `--database-url=${databaseUrl}`,
    `--admin-email=${adminEmail}`,
    `--auth-mode=${authModePre}`,
    `--profile=${profile}`,
    `--out=${artifactDir}/seed.json`,
  ]

  if (vercelBypass) seedArgs.push(`--vercel-bypass=${vercelBypass}`)

  run('pnpm', seedArgs, { cwd: appCwd, env: sharedEnv })

  run('node', [
    `${appCwd}/scripts/migration-cli-check.mjs`,
    `--base-url=${baseUrl}`,
    `--seed-input=${artifactDir}/seed.json`,
    `--cli-root=${legacyCliRoot}`,
    '--mode=legacy',
    `--out=${artifactDir}/cli-main-pre.json`,
  ], { cwd: appCwd, env: sharedEnv })

  runPhaseCheck(1, {
    pre: `${artifactDir}/pre.json`,
    seed: `${artifactDir}/seed.json`,
    'cli-main': `${artifactDir}/cli-main-pre.json`,
  })

  console.log('[phase1] passed')
}

async function runPhase2() {
  console.log('[phase2] cutover deploy on feature branch')
  requireEnv('BASE_URL', baseUrl)
  requirePathExists(featureAppCwd, 'feature app cwd')

  if (!useWorktreeDeploy) {
    run('git', ['checkout', featureBranch], { cwd: repoCwd })
  }

  const envLs = capture('vercel', ['env', 'ls'], { cwd: repoCwd })
  const compatFlagOk = /NUXT_AUTH_ALLOW_LEGACY_CLI[\s\S]*Production/.test(envLs.stdout)
  if (!compatFlagOk) {
    throw new Error('Phase 2 failed: missing NUXT_AUTH_ALLOW_LEGACY_CLI in Production env. Add it before deploy.')
  }

  run('vercel', ['deploy', '--prod', '--yes'], { cwd: featureDeployCwd })
  run('pnpm', ['db:migrate'], { cwd: featureAppCwd, env: sharedEnv })
  const deploymentReady = true

  const loginStatus = await httpStatus(`${baseUrl.replace(/\/+$/, '')}/login`)
  const inviteStatus = await httpStatus(`${baseUrl.replace(/\/+$/, '')}/invite/demo-token`)
  const routesOk = loginStatus < 500 && inviteStatus < 500

  const inspect = capture('vercel', ['inspect', baseUrl], { cwd: repoCwd, allowFailure: true })
  const migrationLogsOk = inspect.status === 0

  runPhaseCheck(2, {
    'compat-flag-ok': compatFlagOk,
    'deployment-ready': deploymentReady,
    'routes-ok': routesOk,
    'migration-logs-ok': migrationLogsOk,
  })

  console.log('[phase2] passed')
}

async function runPhase3() {
  console.log('[phase3] post-migration structural validation')
  requireEnv('DATABASE_URL', databaseUrl)

  run('pnpm', ['db:check:post'], { cwd: appCwd, env: sharedEnv })
  run('pnpm', [
    'migration:snapshot',
    '--mode=post',
    `--run-id=${runId}`,
    `--database-url=${databaseUrl}`,
    `--out=${artifactDir}/post.json`,
  ], { cwd: appCwd, env: sharedEnv })

  const compare = capture('pnpm', [
    'migration:compare',
    `--pre=${artifactDir}/pre.json`,
    `--post=${artifactDir}/post.json`,
    `--run-id=${runId}`,
  ], { cwd: appCwd, env: sharedEnv, allowFailure: true })

  const compareJson = extractJson(compare.stdout)
  await writeFile(`${artifactDir}/compare.json`, JSON.stringify(compareJson, null, 2), 'utf8')

  if (compare.status !== 0) {
    throw new Error('Phase 3 failed: migration:compare reported errors')
  }

  runPhaseCheck(3, {
    post: `${artifactDir}/post.json`,
    compare: `${artifactDir}/compare.json`,
  })

  console.log('[phase3] passed')
}

async function runPhase4() {
  console.log('[phase4] post-cutover functional verification')
  requireEnv('BASE_URL', baseUrl)
  requireEnv('DATABASE_URL', databaseUrl)
  requireEnv('ADMIN_EMAIL', adminEmail)
  requirePathExists(legacyCliRoot, 'legacy CLI root')
  requirePathExists(betterCliRoot, 'better CLI root')

  const verifyArgs = [
    'migration:verify',
    `--seed-input=${artifactDir}/seed.json`,
    `--base-url=${baseUrl}`,
    `--database-url=${databaseUrl}`,
    `--admin-email=${adminEmail}`,
    `--auth-mode=${authModePost}`,
    `--out=${artifactDir}/verify.json`,
  ]
  if (vercelBypass) verifyArgs.push(`--vercel-bypass=${vercelBypass}`)

  run('pnpm', verifyArgs, { cwd: appCwd, env: sharedEnv })

  run('node', [
    `${appCwd}/scripts/migration-cli-check.mjs`,
    `--base-url=${baseUrl}`,
    `--seed-input=${artifactDir}/seed.json`,
    `--cli-root=${legacyCliRoot}`,
    '--mode=legacy',
    `--out=${artifactDir}/cli-main-post.json`,
  ], { cwd: appCwd, env: sharedEnv })

  run('node', [
    `${appCwd}/scripts/migration-cli-check.mjs`,
    `--base-url=${baseUrl}`,
    `--seed-input=${artifactDir}/seed.json`,
    `--cli-root=${betterCliRoot}`,
    '--mode=better',
    `--out=${artifactDir}/cli-better-post.json`,
  ], { cwd: appCwd, env: sharedEnv })

  runPhaseCheck(4, {
    verify: `${artifactDir}/verify.json`,
    'cli-main': `${artifactDir}/cli-main-post.json`,
    'cli-better': `${artifactDir}/cli-better-post.json`,
  })

  console.log('[phase4] passed')
}

async function runPhase5() {
  console.log('[phase5] soak window checks')
  requireEnv('BASE_URL', baseUrl)
  requireEnv('DATABASE_URL', databaseUrl)
  requireEnv('ADMIN_EMAIL', adminEmail)
  requirePathExists(legacyCliRoot, 'legacy CLI root')
  requirePathExists(betterCliRoot, 'better CLI root')

  if (!Number.isFinite(soakIterations) || soakIterations < 1) {
    throw new Error('Invalid --soak-iterations value')
  }
  if (!Number.isFinite(soakIntervalMinutes) || soakIntervalMinutes < 0) {
    throw new Error('Invalid --soak-interval-minutes value')
  }

  const summary = {
    iterationsExpected: soakIterations,
    iterationsObserved: 0,
    verifyFailures: 0,
    cliFailures: 0,
    intervals: [],
  }

  for (let i = 1; i <= soakIterations; i++) {
    const stamp = utcTimeStamp()
    const verifyOut = `${artifactDir}/verify-${stamp}.json`
    const verifyArgs = [
      'migration:verify',
      `--seed-input=${artifactDir}/seed.json`,
      `--base-url=${baseUrl}`,
      `--database-url=${databaseUrl}`,
      `--admin-email=${adminEmail}`,
      '--auth-mode=auto',
      `--out=${verifyOut}`,
    ]
    if (vercelBypass) verifyArgs.push(`--vercel-bypass=${vercelBypass}`)

    const verifyResult = run('pnpm', verifyArgs, { cwd: appCwd, env: sharedEnv, allowFailure: true })
    if (verifyResult.status !== 0) summary.verifyFailures++

    const interval = {
      iteration: i,
      stamp,
      verifyOut,
      verifyStatus: verifyResult.status,
      cliMainOut: null,
      cliMainStatus: null,
      cliBetterOut: null,
      cliBetterStatus: null,
    }

    if (i % 2 === 0) {
      const cliMainOut = `${artifactDir}/cli-main-${stamp}.json`
      const cliMainResult = run('node', [
        `${appCwd}/scripts/migration-cli-check.mjs`,
        `--base-url=${baseUrl}`,
        `--seed-input=${artifactDir}/seed.json`,
        `--cli-root=${legacyCliRoot}`,
        '--mode=legacy',
        '--max-tokens=1',
        `--out=${cliMainOut}`,
      ], { cwd: appCwd, env: sharedEnv, allowFailure: true })

      const cliBetterOut = `${artifactDir}/cli-better-${stamp}.json`
      const cliBetterResult = run('node', [
        `${appCwd}/scripts/migration-cli-check.mjs`,
        `--base-url=${baseUrl}`,
        `--seed-input=${artifactDir}/seed.json`,
        `--cli-root=${betterCliRoot}`,
        '--mode=better',
        '--max-tokens=1',
        `--out=${cliBetterOut}`,
      ], { cwd: appCwd, env: sharedEnv, allowFailure: true })

      if (cliMainResult.status !== 0) summary.cliFailures++
      if (cliBetterResult.status !== 0) summary.cliFailures++

      interval.cliMainOut = cliMainOut
      interval.cliMainStatus = cliMainResult.status
      interval.cliBetterOut = cliBetterOut
      interval.cliBetterStatus = cliBetterResult.status
    }

    summary.iterationsObserved++
    summary.intervals.push(interval)

    if (i < soakIterations) {
      const waitSeconds = Math.floor(soakIntervalMinutes * 60)
      console.log(`[phase5] waiting ${waitSeconds}s before next verify (${i}/${soakIterations})`)
      run('sleep', [String(waitSeconds)], { cwd: appCwd })
    }
  }

  await writeFile(`${artifactDir}/phase5-summary.json`, JSON.stringify(summary, null, 2), 'utf8')

  runPhaseCheck(5, {
    summary: `${artifactDir}/phase5-summary.json`,
  })

  console.log('[phase5] passed')
}

async function runPhase6() {
  console.log('[phase6] rollback procedure')
  run('vercel', ['ls', project], { cwd: repoCwd })

  if (!rollbackTarget) {
    throw new Error('Phase 6 requires --rollback-target=<deployment-url-or-id>')
  }

  run('vercel', ['rollback', rollbackTarget], { cwd: repoCwd })

  runPhaseCheck(6, {
    'rollback-ok': true,
  })

  console.log('[phase6] rollback executed')
}

function runPhaseCheck(phase, payload) {
  const argv = [
    `${appCwd}/scripts/migration-phase-check.mjs`,
    `--phase=${phase}`,
    `--out=${artifactDir}/phase${phase}.json`,
  ]

  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined || value === null) continue
    argv.push(`--${key}=${String(value)}`)
  }

  run('node', argv, { cwd: appCwd, env: sharedEnv })
}

async function ensureWorktree(repoPath, worktreePath, branch) {
  if (existsSync(worktreePath)) {
    run('git', ['-C', worktreePath, 'checkout', branch], { cwd: repoPath })
    return
  }

  run('git', ['-C', repoPath, 'worktree', 'add', worktreePath, branch], { cwd: repoPath })
}

async function httpStatus(url) {
  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'manual',
    })
    return response.status
  } catch {
    return 599
  }
}

function extractJson(output) {
  const text = String(output || '').trim()
  if (!text) throw new Error('Missing compare output')

  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('Unable to parse JSON from compare output')
  }

  const candidate = text.slice(start, end + 1)
  return JSON.parse(candidate)
}

function run(cmd, argv, { cwd, env, allowFailure = false }) {
  const result = spawnSync(cmd, argv, {
    cwd,
    env: env || process.env,
    stdio: allowFailure ? ['inherit', 'inherit', 'inherit'] : 'inherit',
  })

  if (!allowFailure && result.status !== 0) {
    throw new Error(`Command failed (${cmd} ${argv.join(' ')})`)
  }

  return {
    status: result.status || 0,
  }
}

function capture(cmd, argv, { cwd, env, allowFailure = false }) {
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

function requireCleanWorktree(cwd) {
  const status = capture('git', ['status', '--porcelain'], { cwd })
  if (status.stdout.trim().length > 0) {
    throw new Error('Working tree is not clean. Commit/stash changes before running phase 1/2 without worktree deploy mode.')
  }
}

function requireEnv(name, value) {
  if (!value) {
    throw new Error(`Missing required value: ${name}`)
  }
}

function requirePathExists(path, label) {
  if (!existsSync(path)) {
    throw new Error(`Missing ${label}: ${path}`)
  }
}

function parseBool(raw) {
  return String(raw || '').toLowerCase() === 'true'
}

function resolvePhases(raw) {
  if (raw === 'all') return [0, 1, 2, 3, 4, 5]

  const values = raw
    .split(',')
    .map(value => Number(value.trim()))
    .filter(value => Number.isInteger(value) && value >= 0 && value <= 6)

  if (!values.length) {
    throw new Error('Invalid --phase. Use all or comma-separated values between 0 and 6.')
  }

  return Array.from(new Set(values)).sort((a, b) => a - b)
}

function parseArgs(argv) {
  const parsed = {}

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--') continue
    if (!arg.startsWith('--')) continue

    const stripped = arg.slice(2)
    const eq = stripped.indexOf('=')

    if (eq !== -1) {
      const key = stripped.slice(0, eq)
      const value = stripped.slice(eq + 1)
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

function utcRunId() {
  const now = new Date()
  const y = now.getUTCFullYear()
  const m = String(now.getUTCMonth() + 1).padStart(2, '0')
  const d = String(now.getUTCDate()).padStart(2, '0')
  const hh = String(now.getUTCHours()).padStart(2, '0')
  const mm = String(now.getUTCMinutes()).padStart(2, '0')
  const ss = String(now.getUTCSeconds()).padStart(2, '0')
  return `${y}${m}${d}T${hh}${mm}${ss}Z`
}

function utcTimeStamp() {
  const now = new Date()
  const hh = String(now.getUTCHours()).padStart(2, '0')
  const mm = String(now.getUTCMinutes()).padStart(2, '0')
  const ss = String(now.getUTCSeconds()).padStart(2, '0')
  return `${hh}${mm}${ss}`
}
