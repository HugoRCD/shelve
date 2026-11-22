import { rmSync } from 'node:fs'
import { setup } from '@nuxt/test-utils/e2e'
import { describe, beforeAll, afterAll } from 'vitest'
import { E2E_APP_URL, seedUser, authedFetch } from './helpers'
import type { E2EContext } from './helpers'
import { registerTeamTests } from './flows/teams'
import { registerProjectTests } from './flows/projects'
import { registerVariableTests } from './flows/variables'
import { registerVariableGroupTests } from './flows/variable-groups'
import { registerCliTests } from './flows/cli'
import { registerApiKeyTests } from './flows/api-keys'
import { registerAccessControlTests } from './flows/access-control'
import { registerAuditLogTests } from './flows/audit-logs'
import { registerAuthTests } from './flows/auth'
import { registerCleanupTests } from './flows/cleanup'

describe('Team → Project → Variables E2E flow', async () => {
  await setup({
    env: {
      NUXT_TEST_SEED: '1',
      NUXT_PUBLIC_APP_URL: E2E_APP_URL,
    },
  })

  const ctx = {} as E2EContext

  beforeAll(async () => {
    const { cookie } = await seedUser({
      username: 'e2e-user',
      email: 'e2e@shelve.cloud',
    })
    ctx.sessionCookie = cookie
    ctx.api = authedFetch(cookie)
  })

  afterAll(() => {
    if (ctx.cliTmpDir)
      rmSync(ctx.cliTmpDir, { recursive: true, force: true })
  })

  registerTeamTests(ctx)
  registerProjectTests(ctx)
  registerVariableTests(ctx)
  registerVariableGroupTests(ctx)
  registerCliTests(ctx)
  registerApiKeyTests(ctx)
  registerAccessControlTests(ctx)
  registerAuditLogTests(ctx)
  registerAuthTests(ctx)
  registerCleanupTests(ctx)
})
