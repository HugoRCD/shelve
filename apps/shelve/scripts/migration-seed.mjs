import { request } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import postgres from 'postgres'

const args = parseArgs(process.argv.slice(2))
normalizeArgs(args)
const runId = requireArg(args, 'run-id')
const baseUrl = requireArg(args, 'base-url')
const databaseUrl = requireArg(args, 'database-url')
const adminEmail = requireArg(args, 'admin-email').toLowerCase()
const testEmailSeed = (args['test-email'] || `migration+seed@example.com`).toLowerCase()
const outputPath = args.out
const vercelBypass = args['vercel-bypass'] || process.env.E2E_VERCEL_BYPASS

const sql = createDbClient(databaseUrl)
const bypassHeaders = vercelBypass
  ? { 'x-vercel-protection-bypass': vercelBypass }
  : undefined

const summary = {
  runId,
  baseUrl,
  seededAt: new Date().toISOString(),
  authMode: null,
  users: {},
  teams: [],
  projects: [],
  tokens: [],
  checks: {},
}

try {
  const adminApi = await createApiContext(baseUrl, bypassHeaders)
  summary.authMode = await loginWithOtp(adminApi, adminEmail, sql)
  await ensureOnboardingComplete(adminApi, runId)

  const adminTeams = await getTeams(adminApi)
  if (!adminTeams.length) {
    throw new Error('Admin has no teams after onboarding')
  }
  const primaryTeam = adminTeams[0]
  summary.teams.push({ slug: primaryTeam.slug, source: 'existing-or-onboarding' })

  const secondaryTeamName = `Migration ${runId} Team B`
  const secondaryTeam = await ensureTeam(adminApi, secondaryTeamName)
  summary.teams.push({ slug: secondaryTeam.slug, source: 'seeded' })

  const runShort = runId.slice(-6)
  const acceptedInviteEmail = buildEmail(testEmailSeed, `acc-${runShort}`)
  const pendingInviteEmail = buildEmail(testEmailSeed, `pen-${runShort}`)
  const onboardingUserEmail = buildEmail(testEmailSeed, `onb-${runShort}`)

  summary.users = {
    admin: adminEmail,
    acceptedMember: acceptedInviteEmail,
    pendingInvite: pendingInviteEmail,
    onboardingUser: onboardingUserEmail,
  }

  const acceptedInvitation = await createInvitation(adminApi, primaryTeam.slug, acceptedInviteEmail, sql, adminEmail)
  await ensureInvitation(primaryTeam.slug, pendingInviteEmail, adminApi, sql, adminEmail)

  const memberApi = await createApiContext(baseUrl, bypassHeaders)
  await loginWithOtp(memberApi, acceptedInviteEmail, sql)
  await acceptInvitation(memberApi, acceptedInvitation.token, { expectTeamSlug: primaryTeam.slug })

  const memberTeams = await getTeams(memberApi)
  if (!memberTeams.length) {
    throw new Error('Accepted member has no teams')
  }

  const blockedResponse = await memberApi.get('/api/admin/users')
  summary.checks.nonAdminBlockedFromAdminApi = blockedResponse.status() >= 400
  if (!summary.checks.nonAdminBlockedFromAdminApi) {
    throw new Error(`Expected non-admin to be blocked from /api/admin/users, got ${blockedResponse.status()}`)
  }

  const onboardingApi = await createApiContext(baseUrl, bypassHeaders)
  await loginWithOtp(onboardingApi, onboardingUserEmail, sql)
  await ensureOnboardingComplete(onboardingApi, runId)

  const primaryEnvIds = await ensureTeamEnvironments(adminApi, primaryTeam.slug, runId)
  const secondaryEnvIds = await ensureTeamEnvironments(adminApi, secondaryTeam.slug, runId)

  const primaryProjects = await ensureProjects(adminApi, primaryTeam.slug, runId, 3)
  const secondaryProjects = await ensureProjects(adminApi, secondaryTeam.slug, `${runId}-b`, 1)

  for (const project of primaryProjects) {
    await seedVariables(adminApi, primaryTeam.slug, project.id, primaryEnvIds, runId)
    summary.projects.push({ teamSlug: primaryTeam.slug, projectId: project.id, projectName: project.name })
  }

  for (const project of secondaryProjects) {
    await seedVariables(adminApi, secondaryTeam.slug, project.id, secondaryEnvIds, `${runId}-b`)
    summary.projects.push({ teamSlug: secondaryTeam.slug, projectId: project.id, projectName: project.name })
  }

  const tokenA = await createResolvableToken(adminApi, `seed-${runId}-a`)
  const tokenB = await createResolvableToken(adminApi, `seed-${runId}-b`)
  summary.tokens.push({ id: tokenA.id, name: `seed-${runId}-a` })
  summary.tokens.push({ id: tokenB.id, name: `seed-${runId}-b` })

  summary.checks.cliTokenAValid = await verifyCliToken(baseUrl, tokenA.token, bypassHeaders)
  summary.checks.cliTokenBValid = await verifyCliToken(baseUrl, tokenB.token, bypassHeaders)
  if (!summary.checks.cliTokenAValid || !summary.checks.cliTokenBValid) {
    throw new Error('CLI token validation failed')
  }

  summary.checks.seedCompleted = true

  if (outputPath) {
    await writeJson(outputPath, summary)
  }

  console.log(JSON.stringify(summary, null, 2))
} catch (error) {
  if (error && typeof error === 'object') {
    console.error(error)
  } else {
    console.error(String(error))
  }
  if (error instanceof Error && error.stack) {
    console.error(error.stack)
  }
  process.exitCode = 1
} finally {
  await sql.end({ timeout: 5 })
}

async function createApiContext(baseURL, headers) {
  return request.newContext({
    baseURL,
    extraHTTPHeaders: headers,
  })
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

function normalizeArgs(args) {
  if (!args['database-url'] && args['db-url']) args['database-url'] = args['db-url']
}

function requireArg(args, key) {
  const value = args[key]
  if (!value) throw new Error(`--${key} is required`)
  return value
}

function buildEmail(seed, suffix) {
  const [localPartRaw, domainRaw = 'example.com'] = seed.split('@')
  const domain = domainRaw.toLowerCase()

  // Legacy schema uses varchar(50) for users.email/invitations.email, so keep the local part short.
  const maxLocal = Math.max(1, 50 - domain.length - 1)
  const suffixSafe = suffix.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 24)

  const baseMax = Math.max(1, maxLocal - 1 - suffixSafe.length)
  const base = (localPartRaw || 'migration')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, baseMax)

  const local = `${base}+${suffixSafe}`.slice(0, maxLocal)
  return `${local}@${domain}`
}

function createDbClient(url) {
  const host = new URL(url).hostname
  const useSsl = !['localhost', '127.0.0.1'].includes(host)
  return postgres(url, {
    max: 1,
    ssl: useSsl ? 'require' : false,
  })
}

async function loginWithOtp(api, email, sql) {
  const requestedAt = new Date()

  const betterSend = await api.post('/api/auth/email-otp/send-verification-otp', {
    data: { email, type: 'sign-in' },
  })

  if (betterSend.ok() || betterSend.status() === 429) {
    try {
      const otp = await waitForOtp(sql, email, requestedAt, 'better', { timeoutMs: 6_000 })
      const betterVerify = await api.post('/api/auth/sign-in/email-otp', {
        data: { email, otp },
      })
      if (betterVerify.ok()) return 'better-auth'
    } catch {
      // Fall back to legacy OTP if Better Auth isn't actually writing codes in this environment.
    }
  }

  const legacySend = await api.post('/api/auth/otp/send', {
    data: { email },
  })
  if (legacySend.status() === 429) {
    // For rehearsal runs (email service often disabled), bypass the rate-limit by
    // directly priming an OTP in the DB.
    await primeLegacyOtp(sql, email)
  } else if (!legacySend.ok()) {
    if (legacySend.status() >= 500) {
      await primeLegacyOtp(sql, email)
    } else {
      throw new Error(`Legacy OTP send failed (${legacySend.status()}) for ${email}`)
    }
  }

  const otp = await waitForOtp(sql, email, requestedAt, 'legacy')
  const legacyVerify = await api.post('/api/auth/otp/verify', {
    data: { email, code: otp },
  })
  if (!legacyVerify.ok()) {
    const body = await legacyVerify.text().catch(() => '')
    throw new Error(`Legacy OTP verify failed (${legacyVerify.status()}) for ${email}: ${body.slice(0, 240)}`)
  }

  return 'legacy'
}

async function waitForOtp(sql, email, requestedAt, mode, { timeoutMs = 20_000 } = {}) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const otp = mode === 'better'
        ? await fetchBetterOtp(sql, email, requestedAt)
        : await fetchLegacyOtp(sql, email, requestedAt)
      if (otp) return otp
    } catch {
      // Keep polling.
    }
    await sleep(500)
  }
  throw new Error(`OTP not found for ${email} (${mode})`)
}

async function fetchBetterOtp(sql, email, requestedAt) {
  const identifier = `sign-in-otp-${email.toLowerCase()}`
  const rows = await sql`
    select value
    from verification
    where identifier = ${identifier}
      and "createdAt" >= now() - interval '15 minutes'
    order by "createdAt" desc
    limit 1
  `
  if (!rows.length) return null
  const [otp] = String(rows[0].value).split(':')
  return otp || null
}

async function fetchLegacyOtp(sql, email, requestedAt) {
  const rows = await sql`
    select "otpCode"
    from users
    where lower(email) = lower(${email})
      and "otpCode" is not null
      and "otpExpiresAt" > now()
    order by "otpLastRequestAt" desc
    limit 1
  `
  if (!rows.length) return null
  return rows[0].otpCode ? String(rows[0].otpCode) : null
}

async function primeLegacyOtp(sql, email) {
  const username = email.split('@')[0].slice(0, 20)
  const otpCode = String(Math.floor(100000 + Math.random() * 900000))
  const otpToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('')

  const existing = await sql`
    select id
    from users
    where lower(email) = lower(${email})
    limit 1
  `

  if (!existing.length) {
    const nextIdRows = await sql`select coalesce(max(id), 0)::bigint + 1 as id from users`
    const nextId = Number(nextIdRows[0]?.id || 1)
    const hasUsername = await columnExists(sql, 'users', 'username')
    const hasAuthType = await columnExists(sql, 'users', 'authType')
    const hasRole = await columnExists(sql, 'users', 'role')
    const hasOnboarding = await columnExists(sql, 'users', 'onboarding')
    const hasCliInstalled = await columnExists(sql, 'users', 'cliInstalled')
    const hasCreatedAt = await columnExists(sql, 'users', 'createdAt')
    const hasUpdatedAt = await columnExists(sql, 'users', 'updatedAt')

    const columns = ['"id"', '"email"']
    const values = ['$1', '$2']
    const params = [nextId, email]

    if (hasUsername) {
      columns.push('"username"')
      values.push(`$${params.length + 1}`)
      params.push(username)
    }
    if (hasAuthType) {
      columns.push('"authType"')
      values.push(`$${params.length + 1}`)
      params.push('email')
    }
    if (hasRole) {
      columns.push('"role"')
      values.push(`$${params.length + 1}`)
      params.push('user')
    }
    if (hasOnboarding) {
      columns.push('"onboarding"')
      values.push(`$${params.length + 1}`)
      params.push(false)
    }
    if (hasCliInstalled) {
      columns.push('"cliInstalled"')
      values.push(`$${params.length + 1}`)
      params.push(false)
    }
    if (hasCreatedAt) {
      columns.push('"createdAt"')
      values.push(`$${params.length + 1}`)
      params.push(new Date())
    }
    if (hasUpdatedAt) {
      columns.push('"updatedAt"')
      values.push(`$${params.length + 1}`)
      params.push(new Date())
    }

    await sql.unsafe(
      `insert into users (${columns.join(', ')}) values (${values.join(', ')})`,
      params,
    )
  }

  if (await columnExists(sql, 'users', 'username')) {
    await sql`
      update users
      set "username" = coalesce(nullif("username", ''), ${username})
      where lower(email) = lower(${email})
    `
  }
  if (await columnExists(sql, 'users', 'authType')) {
    await sql`
      update users
      set "authType" = coalesce("authType", 'email')
      where lower(email) = lower(${email})
    `
  }
  if (await columnExists(sql, 'users', 'onboarding')) {
    await sql`
      update users
      set "onboarding" = coalesce("onboarding", false)
      where lower(email) = lower(${email})
    `
  }
  if (await columnExists(sql, 'users', 'cliInstalled')) {
    await sql`
      update users
      set "cliInstalled" = coalesce("cliInstalled", false)
      where lower(email) = lower(${email})
    `
  }

  await sql`
    update users
    set
      "otpCode" = ${otpCode},
      "otpToken" = ${otpToken},
      "otpExpiresAt" = now() + interval '10 minutes',
      "otpLastRequestAt" = now(),
      "otpAttempts" = coalesce("otpAttempts", 0) + 1,
      "updatedAt" = now()
    where lower(email) = lower(${email})
  `
}

async function columnExists(sql, table, column) {
  const rows = await sql`
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = ${table}
      and column_name = ${column}
    limit 1
  `
  return rows.length > 0
}

async function ensureOnboardingComplete(api, runId) {
  const teams = await getTeams(api)
  if (teams.length > 0) return teams[0]

  const baseName = `E2E ${runId}`
  let team
  try {
    team = await ensureTeam(api, baseName)
  } catch {
    // If the base name is already taken by another user (unique slug/name), create a unique one.
    team = await ensureTeam(api, `${baseName} onb-${runId.slice(-4)}`)
  }
  await api.post('/api/user/onboarding', {
    data: { teamSlug: team.slug },
  })
  return team
}

async function ensureTeam(api, teamName) {
  const response = await api.post('/api/teams', {
    data: { name: teamName },
  })

  if (response.ok()) return response.json()
  if (response.status() !== 409) {
    throw new Error(`Failed to create team "${teamName}" (${response.status()})`)
  }

  const teams = await getTeams(api)
  const byName = teams.find(team => String(team.name || '').toLowerCase() === teamName.toLowerCase())
  if (byName) return byName

  const slug = teamName.toLowerCase().replace(/\s+/g, '-')
  const existing = teams.find(team => team.slug === slug)
  if (!existing) {
    throw new Error(`Team "${teamName}" exists but could not be resolved`)
  }
  return existing
}

async function getTeams(api) {
  const response = await api.get('/api/teams')
  if (!response.ok()) {
    throw new Error(`Failed to list teams (${response.status()})`)
  }
  return response.json()
}

async function ensureInvitation(teamSlug, email, api, sql, invitedByEmail) {
  const response = await api.post(`/api/teams/${teamSlug}/invitations`, {
    data: { email, role: 'member' },
  })

  if (response.ok()) return response.json()

  // Many environments have email disabled; the invitation row is created but the handler
  // can still fail while sending the email. Treat 5xx as "maybe created" and try to resolve.
  if (response.status() >= 500) {
    const resolved = await resolveInvitation(teamSlug, email, api, sql)
    if (resolved) return resolved
    if (sql && invitedByEmail) {
      const created = await createInvitationInDb(sql, { teamSlug, email, invitedByEmail })
      if (created) return created
    }
  }

  if (response.status() !== 409) {
    throw new Error(`Failed to create invitation for ${email} (${response.status()})`)
  }

  const pending = await api.get(`/api/teams/${teamSlug}/invitations`)
  if (!pending.ok()) {
    throw new Error(`Failed to list invitations (${pending.status()})`)
  }
  const invitations = await pending.json()
  const existing = invitations.find((invitation) => invitation.email.toLowerCase() === email.toLowerCase())
  if (existing) return existing

  const resolved = await resolveInvitation(teamSlug, email, api, sql)
  if (resolved) return resolved

  throw new Error(`Invitation for ${email} already exists but was not found`)
}

async function createInvitation(api, teamSlug, email, sql, invitedByEmail) {
  return ensureInvitation(teamSlug, email, api, sql, invitedByEmail)
}

async function resolveInvitation(teamSlug, email, api, sql) {
  try {
    const pending = await api.get(`/api/teams/${teamSlug}/invitations`)
    if (pending.ok()) {
      const invitations = await pending.json()
      const existing = invitations.find((invitation) => invitation.email.toLowerCase() === email.toLowerCase())
      if (existing) return existing
    }
  } catch {
    // ignore
  }

  if (sql) {
    try {
      const rows = await sql`
        select i.*
        from invitations i
        join teams t on t.id = i."teamId"
        where lower(t.slug) = lower(${teamSlug})
          and lower(i.email) = lower(${email})
        order by i."createdAt" desc
        limit 1
      `
      if (rows.length) return rows[0]
    } catch {
      // ignore
    }
  }

  return null
}

async function createInvitationInDb(sql, { teamSlug, email, invitedByEmail }) {
  const [team] = await sql`
    select id
    from teams
    where lower(slug) = lower(${teamSlug})
    limit 1
  `
  if (!team?.id) return null

  const [inviter] = await sql`
    select id
    from users
    where lower(email) = lower(${invitedByEmail})
    limit 1
  `
  if (!inviter?.id) return null

  const [existing] = await sql`
    select *
    from invitations
    where "teamId" = ${team.id}
      and lower(email) = lower(${email})
      and status::text = 'pending'
    order by "createdAt" desc
    limit 1
  `
  if (existing) return existing

  const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('')

  const rows = await sql.unsafe(
    `insert into invitations ("email","teamId","role","token","status","invitedById","expiresAt","createdAt","updatedAt")\n     values ($1,$2,$3::team_role,$4,$5::invitation_status,$6, now() + interval '7 days', now(), now())\n     returning *`,
    [email, team.id, 'member', token, 'pending', inviter.id],
  )
  return rows[0] || null
}

async function acceptInvitation(api, token, { expectTeamSlug } = {}) {
  const response = await api.post(`/api/invitations/${token}/accept`)
  if (response.ok()) return

  if (response.status() === 400 && expectTeamSlug) {
    const teams = await getTeams(api)
    if (teams.some(team => team.slug === expectTeamSlug)) return
  }

  const body = await response.text().catch(() => '')
  throw new Error(`Failed to accept invitation (${response.status()}): ${body.slice(0, 240)}`)
}

async function ensureTeamEnvironments(api, teamSlug, runId) {
  const baseNames = [`${runId}-dev`, `${runId}-stage`, `${runId}-prod`]
  for (const name of baseNames) {
    await api.post(`/api/teams/${teamSlug}/environments`, {
      data: { name },
    })
  }

  const response = await api.get(`/api/teams/${teamSlug}/environments`)
  if (!response.ok()) {
    throw new Error(`Failed to list environments for ${teamSlug} (${response.status()})`)
  }

  const environments = await response.json()
  if (environments.length < 3) {
    throw new Error(`Expected at least 3 environments for ${teamSlug}, found ${environments.length}`)
  }
  return environments.slice(0, 3).map(env => env.id)
}

async function ensureProjects(api, teamSlug, runId, count) {
  const projects = []

  for (let i = 1; i <= count; i++) {
    const name = `${runId}-project-${i}`
    const payload = {
      name,
      description: `Seeded project ${i} for ${runId}`,
      repository: `https://github.com/example/${runId}-${i}`,
      projectManager: i % 2 === 0 ? 'pnpm' : 'npm',
      homepage: `https://${runId}-${i}.example.com`,
      variablePrefix: `P${i}_${runId.slice(-6).toUpperCase()}`,
    }

    let projectResponse = await api.post(`/api/teams/${teamSlug}/projects`, { data: payload })
    if (!projectResponse.ok() && projectResponse.status() === 409) {
      projectResponse = await api.get(`/api/teams/${teamSlug}/projects/name/${encodeURIComponent(name)}`)
    }
    if (!projectResponse.ok()) {
      throw new Error(`Failed to create/get project "${name}" (${projectResponse.status()})`)
    }
    const project = await projectResponse.json()
    projects.push(project)
  }

  return projects
}

async function seedVariables(api, teamSlug, projectId, environmentIds, runId) {
  const pidShort = String(projectId).replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase()
  const keyBase = `${runId.toUpperCase()}_${pidShort}`

  const variablesPayload = {
    autoUppercase: false,
    environmentIds,
    syncWithGitHub: false,
    variables: [
      { key: `${keyBase}_APIKEY`, value: `${runId}-api-${pidShort}` },
      { key: `${keyBase}_URL`, value: `https://${runId}-${pidShort}.example.com` },
      { key: `${keyBase}_SECRET`, value: `secret-${runId}-${pidShort}` },
    ],
  }

  const response = await api.post(`/api/teams/${teamSlug}/projects/${projectId}/variables`, {
    data: variablesPayload,
  })

  if (!response.ok() && response.status() !== 409) {
    throw new Error(`Failed to seed variables for project ${projectId} (${response.status()})`)
  }
}

async function createResolvableToken(api, name) {
  const createdResponse = await api.post('/api/tokens', {
    data: { name },
  })
  if (!createdResponse.ok()) {
    throw new Error(`Failed to create token "${name}" (${createdResponse.status()})`)
  }
  const createdToken = await createdResponse.json()

  const listResponse = await api.get('/api/tokens')
  if (!listResponse.ok()) {
    throw new Error(`Failed to list tokens (${listResponse.status()})`)
  }
  const tokens = await listResponse.json()
  const resolved = tokens.find(token => token.id === createdToken.id)
  if (!resolved?.token) {
    throw new Error(`Failed to resolve token value for token id ${createdToken.id}`)
  }
  return resolved
}

async function verifyCliToken(baseURL, token, headers) {
  const api = await request.newContext({ baseURL, extraHTTPHeaders: headers })
  const response = await api.post('/api/user/cli', {
    headers: {
      Cookie: `authToken=${token}`,
    },
  })
  await api.dispose()
  return response.ok()
}

async function writeJson(path, payload) {
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, JSON.stringify(payload, null, 2))
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
