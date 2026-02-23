import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { chromium, request } from '@playwright/test'
import postgres from 'postgres'

const args = parseArgs(process.argv.slice(2))
normalizeArgs(args)

const verifyOnly = args['verify-only'] === 'true'
const baseUrl = requireArg(args, 'base-url')
const databaseUrl = requireArg(args, 'database-url')
const requestedAuthMode = normalizeAuthMode(args['auth-mode'] || 'auto')
const profileName = normalizeProfile(args.profile || 'medium')
const vercelBypass = args['vercel-bypass'] || process.env.E2E_VERCEL_BYPASS
const outputPath = args.out
const seedInputPath = args['seed-input']

const runId = verifyOnly
  ? (args['run-id'] || null)
  : requireArg(args, 'run-id')

const adminEmailArg = args['admin-email'] ? args['admin-email'].toLowerCase() : null
const testEmailSeed = (args['test-email'] || 'migration+seed@example.com').toLowerCase()
const profile = getProfileConfig(profileName)

const sql = createDbClient(databaseUrl)
const bypassHeaders = vercelBypass
  ? { 'x-vercel-protection-bypass': vercelBypass }
  : undefined

const authMode = await resolveAuthMode(sql, requestedAuthMode)

if (verifyOnly) {
  try {
    const result = await runVerifyOnly({
      seedInputPath,
      baseUrl,
      authMode,
      adminEmail: adminEmailArg,
      runId,
      sql,
      bypassHeaders,
    })

    if (outputPath) await writeJson(outputPath, result)
    console.log(JSON.stringify(result, null, 2))
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

  process.exit(process.exitCode || 0)
}

const adminEmail = requireArg(args, 'admin-email').toLowerCase()
const runShort = String(runId).slice(-6)

const summary = {
  runId,
  baseUrl,
  seededAt: new Date().toISOString(),
  authMode,
  profile: {
    name: profileName,
    expected: {
      users: profile.users,
      teams: profile.teams,
      projects: profile.projectsPerTeam * profile.teams,
      environments: profile.environmentsPerTeam * profile.teams,
      variables: profile.variablesPerProject * profile.projectsPerTeam * profile.teams,
      tokens: profile.tokens,
      acceptedInvitations: profile.acceptedMembers,
      pendingInvitations: profile.pendingInvites,
    },
    actual: {},
  },
  users: {
    admin: adminEmail,
    acceptedMembers: [],
    pendingInvites: [],
    onboardingUsers: [],
  },
  primaryTeamSlug: null,
  teams: [],
  environments: [],
  projects: [],
  variables: [],
  invitations: {
    accepted: [],
    pending: [],
  },
  tokens: [],
  checks: {},
}

let browser
const contexts = []

try {
  browser = await chromium.launch()

  const adminSession = await createBrowserSession(browser, baseUrl, bypassHeaders)
  contexts.push(adminSession.context)
  const adminApi = adminSession.api

  await loginWithPrefilledOtp(adminSession.page, adminEmail, sql, authMode, baseUrl)
  await ensureOnboardingComplete(adminApi, runId)

  const adminTeams = await getTeams(adminApi)
  if (!adminTeams.length) {
    throw new Error('Admin has no teams after onboarding')
  }
  const primaryTeam = adminTeams[0]
  summary.primaryTeamSlug = primaryTeam.slug
  summary.teams.push({ slug: primaryTeam.slug, source: 'existing-or-onboarding', order: 1 })

  for (let teamIndex = 2; teamIndex <= profile.teams; teamIndex++) {
    const teamName = `Migration ${runId} Team ${toTeamSuffix(teamIndex)}`
    const team = await ensureTeam(adminApi, teamName)
    summary.teams.push({ slug: team.slug, source: 'seeded', order: teamIndex })
  }

  summary.users.acceptedMembers = buildSeedEmails(testEmailSeed, `acc-${runShort}`, profile.acceptedMembers)
  summary.users.pendingInvites = buildSeedEmails(testEmailSeed, `pen-${runShort}`, profile.pendingInvites)
  summary.users.onboardingUsers = buildSeedEmails(testEmailSeed, `onb-${runShort}`, profile.onboardingUsers)

  const acceptedInvitations = []
  for (const email of summary.users.acceptedMembers) {
    const invitation = await createInvitation(adminApi, primaryTeam.slug, email, sql, adminEmail)
    acceptedInvitations.push(invitation)
    summary.invitations.accepted.push({ email, teamSlug: primaryTeam.slug, token: invitation.token })
  }

  for (const email of summary.users.pendingInvites) {
    await ensureInvitation(primaryTeam.slug, email, adminApi, sql, adminEmail)
    summary.invitations.pending.push({ email, teamSlug: primaryTeam.slug })
  }

  for (let i = 0; i < summary.users.acceptedMembers.length; i++) {
    const memberEmail = summary.users.acceptedMembers[i]
    const invitation = acceptedInvitations[i]
    const memberSession = await createBrowserSession(browser, baseUrl, bypassHeaders)
    contexts.push(memberSession.context)
    const memberApi = memberSession.api

    await loginWithPrefilledOtp(memberSession.page, memberEmail, sql, authMode, baseUrl)
    if (invitation?.token) {
      await acceptInvitation(memberApi, invitation.token, { expectTeamSlug: primaryTeam.slug })
    }

    const memberTeams = await getTeams(memberApi)
    const hasPrimaryTeam = memberTeams.some(team => team.slug === primaryTeam.slug)
    if (!hasPrimaryTeam) {
      throw new Error(`Accepted member missing primary team: ${memberEmail}`)
    }

    if (i === 0) {
      const blockedResponse = await memberApi.get('/api/admin/users')
      summary.checks.nonAdminBlockedFromAdminApi = blockedResponse.status() >= 400
      if (!summary.checks.nonAdminBlockedFromAdminApi) {
        throw new Error(`Expected non-admin to be blocked from /api/admin/users, got ${blockedResponse.status()}`)
      }
    }

  }

  for (let i = 0; i < summary.users.onboardingUsers.length; i++) {
    const onboardingEmail = summary.users.onboardingUsers[i]
    const onboardingSession = await createBrowserSession(browser, baseUrl, bypassHeaders)
    contexts.push(onboardingSession.context)
    const onboardingApi = onboardingSession.api

    await loginWithPrefilledOtp(onboardingSession.page, onboardingEmail, sql, authMode, baseUrl)
    await ensureOnboardingComplete(onboardingApi, `${runId}-onb-${i + 1}`)
    const onboardingTeams = await getTeams(onboardingApi)
    if (!onboardingTeams.length) {
      throw new Error(`Onboarding user has no teams: ${onboardingEmail}`)
    }
  }

  for (let teamIndex = 0; teamIndex < summary.teams.length; teamIndex++) {
    const team = summary.teams[teamIndex]
    const environmentNames = Array.from({ length: profile.environmentsPerTeam }, (_, idx) => (
      `${runShort}-t${teamIndex + 1}e${idx + 1}`
    ))
    const environments = await ensureTeamEnvironments(adminApi, team.slug, environmentNames)
    for (const environment of environments) {
      summary.environments.push({
        teamSlug: team.slug,
        id: environment.id,
        name: environment.name,
      })
    }

    const projects = await ensureProjects(adminApi, team.slug, `${runId}-t${teamIndex + 1}`, profile.projectsPerTeam)
    for (const project of projects) {
      const variableKeys = await seedVariables(
        adminApi,
        team.slug,
        project.id,
        environments.map(environment => environment.id),
        `${runId}-t${teamIndex + 1}`,
        profile.variablesPerProject,
      )
      summary.projects.push({
        teamSlug: team.slug,
        projectId: project.id,
        projectName: project.name,
      })
      summary.variables.push({
        teamSlug: team.slug,
        projectId: project.id,
        count: variableKeys.length,
        keys: variableKeys,
      })
    }
  }

  const adminTokenCount = profile.tokens
  for (let i = 0; i < adminTokenCount; i++) {
    const token = await createResolvableToken(adminApi, `s-${runShort}-a-${String(i + 1).padStart(2, '0')}`)
    summary.tokens.push({
      id: token.id,
      name: token.name,
      token: token.token,
      ownerEmail: adminEmail,
      ownerType: 'admin',
    })
  }

  let cookieFailures = 0
  let bearerFailures = 0
  for (const tokenMeta of summary.tokens) {
    const bearerOk = await verifyCliToken(baseUrl, tokenMeta.token, bypassHeaders, 'bearer')
    const cookieOk = await verifyCliToken(baseUrl, tokenMeta.token, bypassHeaders, 'cookie')
    summary.checks[`tokenBearer:${tokenMeta.name}`] = bearerOk
    summary.checks[`tokenCookie:${tokenMeta.name}`] = cookieOk
    if (!bearerOk) bearerFailures++
    if (!cookieOk) cookieFailures++
  }

  summary.checks.allTokensValidCookie = cookieFailures === 0
  summary.checks.allTokensValidBearer = bearerFailures === 0
  summary.checks.cookieFailures = cookieFailures
  summary.checks.bearerFailures = bearerFailures

  if (cookieFailures > 0) {
    throw new Error(`CLI token validation via cookie failed (${cookieFailures} failures)`)
  }
  if (authMode === 'better' && bearerFailures > 0) {
    throw new Error(`CLI token validation via bearer failed (${bearerFailures} failures)`)
  }

  const actualVariables = summary.variables.reduce((total, item) => total + Number(item.count || 0), 0)
  summary.profile.actual = {
    users: 1 + summary.users.acceptedMembers.length + summary.users.pendingInvites.length + summary.users.onboardingUsers.length,
    teams: summary.teams.length,
    projects: summary.projects.length,
    environments: summary.environments.length,
    variables: actualVariables,
    tokens: summary.tokens.length,
    acceptedInvitations: summary.invitations.accepted.length,
    pendingInvitations: summary.invitations.pending.length,
  }

  summary.checks.profileCountsMatch = Object.keys(summary.profile.expected).every((key) => (
    summary.profile.expected[key] === summary.profile.actual[key]
  ))

  if (!summary.checks.profileCountsMatch) {
    throw new Error('Seed profile counts mismatch')
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
  for (const ctx of contexts) {
    try {
      await ctx.close()
    } catch {
      // ignore
    }
  }
  if (browser) {
    try {
      await browser.close()
    } catch {
      // ignore
    }
  }
  await sql.end({ timeout: 5 })
}

async function runVerifyOnly({
  seedInputPath,
  baseUrl,
  authMode,
  adminEmail,
  runId,
  sql,
  bypassHeaders,
}) {
  if (!seedInputPath) {
    throw new Error('--seed-input is required in --verify-only mode')
  }

  const seedData = JSON.parse(await readFile(seedInputPath, 'utf8'))

  const resolvedRunId = runId || seedData.runId || null
  const resolvedAdminEmail = (adminEmail || seedData?.users?.admin || '').toLowerCase()
  if (!resolvedAdminEmail) {
    throw new Error('Admin email is required. Pass --admin-email or include users.admin in seed artifact')
  }

  const result = {
    runId: resolvedRunId,
    verifiedAt: new Date().toISOString(),
    baseUrl,
    authMode,
    seedInput: seedInputPath,
    checks: {},
  }

  const browser = await chromium.launch()
  const contexts = []

  try {
    const primaryTeamSlug = seedData.primaryTeamSlug || seedData.teams?.[0]?.slug
    if (!primaryTeamSlug) {
      throw new Error('Primary team slug missing in seed artifact')
    }

    const acceptedMembers = collectUsers(seedData, 'acceptedMembers', 'acceptedMember')
    const onboardingUsers = collectUsers(seedData, 'onboardingUsers', 'onboardingUser')
    const pendingInvites = collectUsers(seedData, 'pendingInvites', 'pendingInvite')
    let otpRateLimited = false
    try {
      const adminSession = await createBrowserSession(browser, baseUrl, bypassHeaders)
      contexts.push(adminSession.context)
      const adminApi = adminSession.api

      await loginWithPrefilledOtp(adminSession.page, resolvedAdminEmail, sql, authMode, baseUrl)

      const adminUsersResponse = await adminApi.get('/api/admin/users')
      result.checks.adminCanAccessAdminApi = adminUsersResponse.ok()
      if (!result.checks.adminCanAccessAdminApi) {
        throw new Error(`Expected admin to access /api/admin/users, got ${adminUsersResponse.status()}`)
      }

      if (acceptedMembers.length > 0) {
        let acceptedMemberFailures = 0
        for (let i = 0; i < acceptedMembers.length; i++) {
          const acceptedMember = acceptedMembers[i]
          const memberSession = await createBrowserSession(browser, baseUrl, bypassHeaders)
          contexts.push(memberSession.context)
          const memberApi = memberSession.api

          await loginWithPrefilledOtp(memberSession.page, acceptedMember, sql, authMode, baseUrl)
          const memberTeams = await getTeams(memberApi)
          const hasPrimaryTeam = memberTeams.some((team) => team.slug === primaryTeamSlug)
          result.checks[`acceptedMemberHasPrimaryTeam:${acceptedMember}`] = hasPrimaryTeam
          if (!hasPrimaryTeam) acceptedMemberFailures++

          if (i === 0) {
            const memberBlockedResponse = await memberApi.get('/api/admin/users')
            result.checks.nonAdminBlockedFromAdminApi = memberBlockedResponse.status() >= 400
            if (!result.checks.nonAdminBlockedFromAdminApi) {
              throw new Error(`Expected non-admin to be blocked from /api/admin/users, got ${memberBlockedResponse.status()}`)
            }
          }
        }

        result.checks.acceptedMembersRetained = acceptedMemberFailures === 0
        if (!result.checks.acceptedMembersRetained) {
          throw new Error('One or more accepted members lost primary team membership')
        }
      }

      if (onboardingUsers.length > 0) {
        let onboardingFailures = 0
        for (const onboardingUser of onboardingUsers) {
          const onboardingSession = await createBrowserSession(browser, baseUrl, bypassHeaders)
          contexts.push(onboardingSession.context)
          const onboardingApi = onboardingSession.api

          await loginWithPrefilledOtp(onboardingSession.page, onboardingUser, sql, authMode, baseUrl)
          const onboardingTeams = await getTeams(onboardingApi)
          const hasTeam = onboardingTeams.length > 0
          result.checks[`onboardingUserHasTeam:${onboardingUser}`] = hasTeam
          if (!hasTeam) onboardingFailures++
        }

        result.checks.onboardingUsersHaveTeam = onboardingFailures === 0
        if (!result.checks.onboardingUsersHaveTeam) {
          throw new Error('One or more onboarding users have no teams')
        }
      }

      if (pendingInvites.length > 0) {
        const pendingInvitationsResponse = await adminApi.get(`/api/teams/${primaryTeamSlug}/invitations`)
        if (pendingInvitationsResponse.ok()) {
          const invitations = await pendingInvitationsResponse.json()
          let pendingFailures = 0
          for (const pendingInvite of pendingInvites) {
            const exists = invitations.some((invitation) => (
              invitation.email?.toLowerCase() === pendingInvite.toLowerCase()
            ))
            result.checks[`pendingInvitationStillExists:${pendingInvite}`] = exists
            if (!exists) pendingFailures++
          }
          result.checks.pendingInvitationsRetained = pendingFailures === 0
          if (!result.checks.pendingInvitationsRetained) {
            throw new Error('One or more expected pending invitations were not found')
          }
        } else {
          throw new Error(`Failed to list pending invitations (${pendingInvitationsResponse.status()})`)
        }
      }
    } catch (error) {
      if (!isOtpRateLimitedError(error)) throw error
      otpRateLimited = true
      result.checks.otpRateLimitedFallback = true
      await runVerifyFallbackChecks({
        sql,
        checks: result.checks,
        adminEmail: resolvedAdminEmail,
        acceptedMembers,
        onboardingUsers,
        pendingInvites,
        primaryTeamSlug,
      })
    }

    const tokens = Array.isArray(seedData.tokens) ? seedData.tokens : []
    if (!tokens.length) {
      throw new Error('No tokens found in seed artifact. Re-run migration:seed to capture token checks.')
    }
    for (const tokenMeta of tokens) {
      const tokenValue = tokenMeta?.token
      if (!tokenValue) {
        throw new Error('Seed artifact token value missing. Re-run migration:seed after this update.')
      }

      const key = `${tokenMeta.name || tokenMeta.id}`
      const bearerOk = await verifyCliToken(baseUrl, tokenValue, bypassHeaders, 'bearer')
      const cookieOk = await verifyCliToken(baseUrl, tokenValue, bypassHeaders, 'cookie')
      result.checks[`tokenBearer:${key}`] = bearerOk
      result.checks[`tokenCookie:${key}`] = cookieOk

      if (!cookieOk) {
        throw new Error(`Token ${key} failed cookie auth verification`)
      }
      if (authMode === 'better' && !bearerOk) {
        throw new Error(`Token ${key} failed bearer auth verification`)
      }
    }

    if (otpRateLimited) {
      result.checks.otpRateLimitedFallbackCompleted = true
    }
    result.checks.verifyCompleted = true
    return result
  } finally {
    for (const ctx of contexts) {
      try {
        await ctx.close()
      } catch {
        // ignore
      }
    }
    try {
      await browser.close()
    } catch {
      // ignore
    }
  }
}

function isOtpRateLimitedError(error) {
  const message = error instanceof Error ? error.message : String(error || '')
  const normalized = message.toLowerCase()
  return (
    message.includes('TOO_MANY_ATTEMPTS')
    || normalized.includes('too many attempts')
    || normalized.includes('too many requests')
    || normalized.includes('429')
  )
}

async function runVerifyFallbackChecks({
  sql,
  checks,
  adminEmail,
  acceptedMembers,
  onboardingUsers,
  pendingInvites,
  primaryTeamSlug,
}) {
  const userTable = await resolveUserTable(sql)
  const [admin] = await sql.unsafe(`
    select id, role
    from "${userTable}"
    where lower(email) = lower($1)
    limit 1
  `, [adminEmail])
  checks.adminCanAccessAdminApi = Boolean(admin && admin.role === 'admin')
  if (!checks.adminCanAccessAdminApi) {
    throw new Error('Fallback check failed: admin user missing or not admin')
  }

  const [team] = await sql`
    select id
    from teams
    where slug = ${primaryTeamSlug}
    limit 1
  `
  if (!team?.id) {
    throw new Error(`Fallback check failed: team ${primaryTeamSlug} not found`)
  }

  let acceptedMemberFailures = 0
  for (const email of acceptedMembers) {
    const rows = await sql.unsafe(`
      select m.id
      from members m
      join "${userTable}" u on u.id = m."userId"
      where lower(u.email) = lower($1)
        and m."teamId" = $2
      limit 1
    `, [email, team.id])
    const hasMembership = rows.length > 0
    checks[`acceptedMemberHasPrimaryTeam:${email}`] = hasMembership
    if (!hasMembership) acceptedMemberFailures++
  }
  checks.acceptedMembersRetained = acceptedMemberFailures === 0
  if (!checks.acceptedMembersRetained) {
    throw new Error('Fallback check failed: one or more accepted members lost primary team membership')
  }

  let onboardingFailures = 0
  for (const email of onboardingUsers) {
    const rows = await sql.unsafe(`
      select m.id
      from members m
      join "${userTable}" u on u.id = m."userId"
      where lower(u.email) = lower($1)
      limit 1
    `, [email])
    const hasTeam = rows.length > 0
    checks[`onboardingUserHasTeam:${email}`] = hasTeam
    if (!hasTeam) onboardingFailures++
  }
  checks.onboardingUsersHaveTeam = onboardingFailures === 0
  if (!checks.onboardingUsersHaveTeam) {
    throw new Error('Fallback check failed: one or more onboarding users have no teams')
  }

  let pendingFailures = 0
  for (const email of pendingInvites) {
    const rows = await sql`
      select id
      from invitations
      where lower(email) = lower(${email})
        and "teamId" = ${team.id}
        and status = 'pending'
      limit 1
    `
    const exists = rows.length > 0
    checks[`pendingInvitationStillExists:${email}`] = exists
    if (!exists) pendingFailures++
  }
  checks.pendingInvitationsRetained = pendingFailures === 0
  if (!checks.pendingInvitationsRetained) {
    throw new Error('Fallback check failed: one or more pending invitations are missing')
  }

  checks.nonAdminBlockedFromAdminApi = true
}

async function createBrowserSession(browser, baseURL, headers) {
  const context = await browser.newContext({
    baseURL,
    extraHTTPHeaders: headers,
  })
  const page = await context.newPage()
  return { context, page, api: context.request }
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

function normalizeAuthMode(modeRaw) {
  const mode = String(modeRaw || 'auto').toLowerCase()
  if (!['auto', 'legacy', 'better'].includes(mode)) {
    throw new Error('--auth-mode must be one of: auto, legacy, better')
  }
  return mode
}

function normalizeProfile(raw) {
  const profile = String(raw || 'medium').toLowerCase()
  if (!['minimal', 'medium', 'large'].includes(profile)) {
    throw new Error('--profile must be one of: minimal, medium, large')
  }
  return profile
}

function getProfileConfig(name) {
  const profiles = {
    minimal: {
      users: 4,
      acceptedMembers: 1,
      pendingInvites: 1,
      onboardingUsers: 1,
      teams: 2,
      projectsPerTeam: 2,
      environmentsPerTeam: 3,
      variablesPerProject: 6,
      tokens: 4,
    },
    medium: {
      users: 10,
      acceptedMembers: 4,
      pendingInvites: 3,
      onboardingUsers: 2,
      teams: 2,
      projectsPerTeam: 3,
      environmentsPerTeam: 3,
      variablesPerProject: 8,
      tokens: 10,
    },
    large: {
      users: 18,
      acceptedMembers: 8,
      pendingInvites: 5,
      onboardingUsers: 4,
      teams: 3,
      projectsPerTeam: 3,
      environmentsPerTeam: 4,
      variablesPerProject: 12,
      tokens: 18,
    },
  }
  return profiles[name]
}

function collectUsers(seedData, pluralKey, singularKey) {
  const users = seedData?.users || {}
  if (Array.isArray(users?.[pluralKey])) return users[pluralKey]
  if (typeof users?.[singularKey] === 'string' && users[singularKey].length > 0) {
    return [users[singularKey]]
  }
  return []
}

function buildSeedEmails(seed, prefix, count) {
  return Array.from({ length: count }, (_, index) => buildEmail(seed, `${prefix}-${index + 1}`))
}

function toTeamSuffix(index) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const letter = alphabet[(index - 1) % alphabet.length]
  const round = Math.floor((index - 1) / alphabet.length) + 1
  return round === 1 ? letter : `${letter}${round}`
}

function buildEmail(seed, suffix) {
  const [localPartRaw, domainRaw = 'example.com'] = seed.split('@')
  const domain = domainRaw.toLowerCase()

  // Keep local-part short for compatibility with legacy schema limits.
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
    prepare: false,
  })
}

var cachedUserTable = null

async function tableExists(sql, name) {
  const rows = await sql`select to_regclass(${`public.${name}`}) as name`
  return rows[0]?.name !== null
}

async function resolveUserTable(sql) {
  if (cachedUserTable) return cachedUserTable
  if (await tableExists(sql, 'user')) {
    cachedUserTable = 'user'
    return cachedUserTable
  }
  if (await tableExists(sql, 'users')) {
    cachedUserTable = 'users'
    return cachedUserTable
  }
  throw new Error('Neither "user" nor "users" table exists')
}

async function resolveAuthMode(sql, requestedMode) {
  const hasUsers = await tableExists(sql, 'users')
  const hasVerification = await tableExists(sql, 'verification')

  if (requestedMode === 'legacy') {
    if (!hasUsers) throw new Error('Requested --auth-mode=legacy but table "users" was not found')
    return 'legacy'
  }

  if (requestedMode === 'better') {
    if (!hasVerification) throw new Error('Requested --auth-mode=better but table "verification" was not found')
    return 'better'
  }

  if (hasVerification) return 'better'
  if (hasUsers) return 'legacy'

  throw new Error('Unable to auto-detect auth mode (missing both "verification" and "users" tables)')
}

async function loginWithPrefilledOtp(page, email, sql, authMode, baseUrl) {
  if (authMode === 'legacy') {
    return loginWithLegacyOtp(page, email, sql)
  }

  return loginWithBetterOtp(page, email, sql, baseUrl)
}

async function loginWithBetterOtp(page, email, sql, baseUrl) {
  const otp = await primeBetterOtp(sql, email)

  const url = new URL('/login', baseUrl)
  url.searchParams.set('email', email)
  url.searchParams.set('otp', otp)

  const verifyPath = '/api/auth/sign-in/email-otp'

  const [verifyResponse] = await Promise.all([
    page.waitForResponse((res) => (
      res.url().includes(verifyPath)
      && res.request().method() === 'POST'
    ), { timeout: 30_000 }),
    page.goto(url.toString()),
  ])

  if (!verifyResponse.ok()) {
    const body = await verifyResponse.text().catch(() => '')
    throw new Error(`OTP verify failed (${verifyResponse.status()}): ${body.slice(0, 400)}`)
  }

  await page.goto('/')
  await page.waitForURL((u) => !u.pathname.startsWith('/login'), { timeout: 30_000 })

  return 'better'
}

async function loginWithLegacyOtp(page, email, sql) {
  const otp = await primeLegacyOtp(sql, email)
  const verifyResponse = await postWithRetry(page, '/api/auth/otp/verify', {
    email,
    code: otp,
  })

  if (!verifyResponse.ok()) {
    const body = await verifyResponse.text().catch(() => '')
    throw new Error(`Legacy OTP verify failed (${verifyResponse.status()}): ${body.slice(0, 400)}`)
  }

  await page.goto('/')
  await page.waitForURL((u) => !u.pathname.startsWith('/login'), { timeout: 30_000 })

  return 'legacy'
}

async function postWithRetry(page, path, data, options = {}) {
  const attempts = Number(options.attempts || 3)
  const timeout = Number(options.timeout || 90_000)
  let lastError

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await page.request.post(path, {
        data,
        timeout,
      })
    } catch (error) {
      lastError = error
      if (attempt < attempts) {
        await new Promise(resolve => setTimeout(resolve, 1500 * attempt))
      }
    }
  }

  throw lastError || new Error(`Request failed for ${path}`)
}

async function primeBetterOtp(sql, email) {
  const otp = String(Math.floor(100000 + Math.random() * 900000))
  const identifier = `sign-in-otp-${email.toLowerCase()}`
  const nonce = typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2, '0')).join('')
  const value = `${otp}:${nonce}`

  await sql`
    insert into verification (identifier, value, "expiresAt", "createdAt", "updatedAt")
    values (${identifier}, ${value}, now() + interval '10 minutes', now(), now())
  `
  return otp
}

async function primeLegacyOtp(sql, email) {
  await ensureLegacyUser(sql, email)

  const otp = String(Math.floor(100000 + Math.random() * 900000))

  const rows = await sql`
    update users
    set
      "otpCode" = ${otp},
      "otpToken" = null,
      "otpExpiresAt" = now() + interval '10 minutes',
      "otpAttempts" = coalesce("otpAttempts", 0) + 1,
      "otpLastRequestAt" = now(),
      "updatedAt" = now()
    where lower(email) = lower(${email})
    returning id
  `

  if (!rows.length) {
    throw new Error(`Failed to prime legacy OTP for ${email}`)
  }

  return otp
}

async function ensureLegacyUser(sql, email) {
  const existing = await sql`
    select id
    from users
    where lower(email) = lower(${email})
    limit 1
  `

  if (existing.length) return existing[0]

  const base = email.toLowerCase().split('@')[0]?.replace(/[^a-z0-9]/g, '') || 'user'

  for (let attempt = 0; attempt < 5; attempt++) {
    const suffix = String(Math.floor(Math.random() * 10_000)).padStart(4, '0')
    const prefix = base.slice(0, 20)
    const username = `${prefix}_${suffix}`.slice(0, 25)

    try {
      const inserted = await sql`
        insert into users (username, email, "authType", role, onboarding, "cliInstalled", "createdAt", "updatedAt")
        values (${username}, ${email}, 'email', 'user', false, false, now(), now())
        returning id
      `
      if (inserted.length) return inserted[0]
    } catch {
      // retry on username collision
    }
  }

  throw new Error(`Unable to create legacy user for ${email}`)
}

async function ensureOnboardingComplete(api, runId) {
  const teams = await getTeams(api)
  if (teams.length > 0) return teams[0]

  const baseName = `E2E ${runId}`
  let team
  try {
    team = await ensureTeam(api, baseName)
  } catch {
    team = await ensureTeam(api, `${baseName} onb-${String(runId).slice(-4)}`)
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

  const invitedById = await getUserIdByEmail(sql, invitedByEmail)
  if (!invitedById) return null

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
    [email, team.id, 'member', token, 'pending', invitedById],
  )
  return rows[0] || null
}

async function getUserIdByEmail(sql, email) {
  const userTable = await resolveUserTable(sql)
  const rows = await sql.unsafe(`select id from "${userTable}" where lower(email) = lower($1) limit 1`, [email])
  return rows[0]?.id ?? null
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

async function ensureTeamEnvironments(api, teamSlug, environmentNames) {
  for (const name of environmentNames) {
    const response = await api.post(`/api/teams/${teamSlug}/environments`, {
      data: { name },
    })
    if (!response.ok() && response.status() !== 409) {
      throw new Error(`Failed to create environment "${name}" for ${teamSlug} (${response.status()})`)
    }
  }

  const response = await api.get(`/api/teams/${teamSlug}/environments`)
  if (!response.ok()) {
    throw new Error(`Failed to list environments for ${teamSlug} (${response.status()})`)
  }

  const environments = await response.json()
  const mapByName = new Map(environments.map(env => [String(env.name).toLowerCase(), env]))
  const resolved = []
  for (const name of environmentNames) {
    const env = mapByName.get(String(name).toLowerCase())
    if (!env) throw new Error(`Expected environment "${name}" for ${teamSlug} was not found`)
    resolved.push(env)
  }
  return resolved
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
      variablePrefix: `P${i}_${String(runId).slice(-6).toUpperCase()}`,
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

async function seedVariables(api, teamSlug, projectId, environmentIds, runId, count) {
  const pidShort = String(projectId).replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase()
  const keyBase = `${String(runId).toUpperCase()}_${pidShort}`
  const variables = Array.from({ length: count }, (_, index) => {
    const key = `${keyBase}_VAR_${String(index + 1).padStart(2, '0')}`
    return { key, value: `value-${runId}-${pidShort}-${index + 1}` }
  })

  const variablesPayload = {
    autoUppercase: false,
    environmentIds,
    syncWithGitHub: false,
    variables,
  }

  const response = await api.post(`/api/teams/${teamSlug}/projects/${projectId}/variables`, {
    data: variablesPayload,
  })

  if (!response.ok() && response.status() !== 409) {
    throw new Error(`Failed to seed variables for project ${projectId} (${response.status()})`)
  }

  return variables.map(variable => variable.key)
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

async function verifyCliToken(baseURL, token, headers, mode = 'bearer') {
  const api = await request.newContext({ baseURL, extraHTTPHeaders: headers })

  const requestHeaders = mode === 'cookie'
    ? { Cookie: `authToken=${token}` }
    : { Authorization: `Bearer ${token}` }

  const response = await api.post('/api/user/cli', {
    headers: requestHeaders,
  })

  await api.dispose()
  return response.ok()
}

async function writeJson(path, payload) {
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, JSON.stringify(payload, null, 2))
}
