import { rmSync } from 'node:fs'
import { setup } from '@nuxt/test-utils/e2e'
import { describe, beforeAll, afterAll } from 'vitest'
import { seedUser, authedFetch } from './helpers'
import type { E2EContext } from './helpers'
import { registerTeamTests } from './flows/teams'
import { registerProjectTests } from './flows/projects'
import { registerVariableTests } from './flows/variables'
import { registerVariableGroupTests } from './flows/variable-groups'
import { registerCliTests } from './flows/cli'
import { registerCleanupTests } from './flows/cleanup'

describe('Team → Project → Variables E2E flow', async () => {
  await setup({
    env: {
      NUXT_TEST_SEED: '1',
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
  registerCleanupTests(ctx)
})
