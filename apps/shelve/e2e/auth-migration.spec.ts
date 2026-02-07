import { test, expect, request, type Page } from '@playwright/test'
import postgres from 'postgres'

const env = {
  baseUrl: requireEnv('E2E_BASE_URL'),
  databaseUrl: requireEnv('E2E_DATABASE_URL'),
  adminEmail: requireEnv('E2E_ADMIN_EMAIL'),
  teamSlug: process.env.E2E_TEAM_SLUG,
  testEmailSeed: requireEnv('E2E_TEST_EMAIL'),
}
const vercelBypass = process.env.E2E_VERCEL_BYPASS
const bypassHeaders = vercelBypass
  ? { 'x-vercel-protection-bypass': vercelBypass }
  : undefined

const runId = process.env.E2E_RUN_ID || new Date().toISOString().replace(/[-:.TZ]/g, '')
const inviteEmail = buildEmail(env.testEmailSeed, runId)

const sql = createDbClient(env.databaseUrl)

test.afterAll(async () => {
  await sql.end({ timeout: 5 })
})

test.describe.serial('better-auth migration e2e', () => {
  test('admin can log in and access admin page', async ({ page }) => {
    await loginWithEmail(page, env.adminEmail)

    await page.goto('/admin')
    await expect(page.getByText('Manage users and their roles')).toBeVisible()
  })

  test('cli token works via authToken cookie', async ({ page }) => {
    await loginWithEmail(page, env.adminEmail)

    await page.goto('/user/tokens')

    const tokenName = `e2e-${runId}`
    const createdResponse = await page.request.post('/api/tokens', {
      data: { name: tokenName },
    })
    expect(createdResponse.ok()).toBeTruthy()
    const createdToken = await createdResponse.json()
    expect(createdToken?.id).toBeTruthy()

    const tokensResponse = await page.request.get('/api/tokens')
    expect(tokensResponse.ok()).toBeTruthy()
    const tokens = await tokensResponse.json()
    const created = tokens.find((token: { id: string }) => token.id === createdToken.id)
    expect(created?.token).toBeTruthy()

    const api = await request.newContext({ baseURL: env.baseUrl, extraHTTPHeaders: bypassHeaders })
    const cliResponse = await api.post('/api/user/cli', {
      headers: {
        Cookie: `authToken=${created.token}`,
      },
    })
    expect(cliResponse.ok()).toBeTruthy()
    await api.dispose()
  })

  test('invitation flow keeps team membership working', async ({ page, browser }) => {
    await loginWithEmail(page, env.adminEmail)

    const teamSlug = await resolveTeamSlug(page)
    const invitation = await createInvitation(page, teamSlug, inviteEmail)

    const inviteContext = await browser.newContext()
    const invitePage = await inviteContext.newPage()

    await loginWithEmail(invitePage, inviteEmail, { redirectPath: `/invite/${invitation.token}` })

    await expect(invitePage.getByRole('button', { name: 'Accept Invitation' })).toBeVisible()
    const [acceptResponse] = await Promise.all([
      invitePage.waitForResponse((res) => (
        res.url().includes(`/api/invitations/${invitation.token}/accept`)
        && res.request().method() === 'POST'
      )),
      invitePage.getByRole('button', { name: 'Accept Invitation' }).click(),
    ])

    expect(acceptResponse.ok()).toBeTruthy()
    const acceptJson = await acceptResponse.json().catch(() => null) as { teamSlug?: string | null } | null
    const invitedTeamSlug = acceptJson?.teamSlug || teamSlug

    await invitePage.goto(`/${invitedTeamSlug}`)
    await ensureOnboardingComplete(invitePage, runId)

    await invitePage.goto(`/${invitedTeamSlug}/team/members`)
    await expect(invitePage.getByText(inviteEmail, { exact: false })).toBeVisible()

    await inviteContext.close()
  })

  test('non-admin users are blocked from admin', async ({ page }) => {
    await loginWithEmail(page, inviteEmail)

    await page.goto('/admin')
    await page.waitForURL((url) => !url.pathname.startsWith('/admin'))
    expect(page.url()).not.toContain('/admin')
  })
})

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`${name} is required to run Playwright tests`)
  }
  return value
}

function buildEmail(seed: string, suffix: string): string {
  const base = seed.toLowerCase()
  const [local, domain = 'example.com'] = base.split('@')
  const short = suffix.slice(-12)
  return `${local}+e2e-${short}@${domain}`.toLowerCase()
}

function createDbClient(databaseUrl: string) {
  const host = new URL(databaseUrl).hostname
  const useSsl = !['localhost', '127.0.0.1'].includes(host)
  return postgres(databaseUrl, {
    max: 1,
    ssl: useSsl ? 'require' : false,
  })
}

async function loginWithEmail(
  page: Page,
  email: string,
  options: { redirectPath?: string } = {},
) {
  // Better Auth deletes the verification row after successful sign-in.
  // Always request a fresh OTP so serial tests don't depend on previous state.
  const requestedAt = new Date()
  const sendResponse = await page.request.post('/api/auth/email-otp/send-verification-otp', {
    data: { email, type: 'sign-in' },
  })
  if (!sendResponse.ok() && sendResponse.status() !== 429) {
    throw new Error(`Failed to send OTP (${sendResponse.status()})`)
  }

  const otp = await waitForOtp(email, requestedAt)

  // Avoid flaky UI-based OTP submission by signing in via API and relying on the
  // browser context's shared cookie jar (page.request shares cookies).
  const signInResponse = await page.request.post('/api/auth/sign-in/email-otp', {
    data: { email, otp },
  })
  if (!signInResponse.ok()) {
    throw new Error(`Failed to sign in with OTP (${signInResponse.status()})`)
  }

  await page.goto(options.redirectPath || '/')
  await page.waitForURL((url) => !url.pathname.startsWith('/login'))
  await ensureOnboardingComplete(page, runId)
}

async function waitForOtp(email: string, minCreatedAt: Date): Promise<string> {
  const deadline = Date.now() + 15_000
  while (Date.now() < deadline) {
    try {
      const otp = await fetchLatestOtp(email, minCreatedAt)
      if (otp) return otp
    } catch {
      // keep polling
    }
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  throw new Error(`OTP not found for ${email}`)
}

async function fetchLatestOtp(email: string, minCreatedAt: Date): Promise<string> {
  const identifier = `sign-in-otp-${email.toLowerCase()}`
  const rows = await sql`
    select value
    from verification
    where identifier = ${identifier}
      and "createdAt" >= ${minCreatedAt}
    order by "createdAt" desc
    limit 1
  `

  if (!rows.length) {
    throw new Error('No OTP in verification table')
  }

  const [otp] = String(rows[0].value).split(':')
  if (!otp) {
    throw new Error('OTP value is empty')
  }

  return otp
}

async function ensureOnboardingComplete(page: Page, suffix: string) {
  if (!page.url().includes('/onboarding')) return

  await page.getByPlaceholder('Nuxtlabs, Vercel, etc.').fill(`E2E ${suffix}`)
  await page.getByRole('button', { name: 'Create Team' }).click()
  await page.waitForURL((url) => !url.pathname.startsWith('/onboarding'))
}

async function createInvitation(
  page: Page,
  teamSlug: string,
  email: string,
) {
  const response = await page.request.post(`/api/teams/${teamSlug}/invitations`, {
    data: {
      email,
      role: 'member',
    },
  })

  if (response.ok()) {
    return response.json()
  }

  if (response.status() === 409) {
    const pending = await page.request.get(`/api/teams/${teamSlug}/invitations`)
    if (!pending.ok()) {
      throw new Error('Failed to fetch pending invitations')
    }
    const invitations = await pending.json()
    const existing = invitations.find((invitation: { email: string }) => invitation.email.toLowerCase() === email.toLowerCase())
    if (!existing) {
      throw new Error('Invitation already exists but could not be found')
    }
    return existing
  }

  throw new Error(`Invitation creation failed (${response.status()})`)
}

async function resolveTeamSlug(page: Page): Promise<string> {
  if (env.teamSlug) return env.teamSlug

  const response = await page.request.get('/api/teams')
  if (!response.ok()) {
    throw new Error('Failed to fetch teams to resolve E2E team slug')
  }

  const teams = await response.json()
  const [team] = teams as Array<{ slug?: string }>
  if (!team?.slug) {
    throw new Error('No teams found; set E2E_TEAM_SLUG or complete onboarding')
  }

  return team.slug
}
