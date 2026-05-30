import { resolveSyncPolicy, type ShelveSyncConfig } from '@types'
import { and, eq, inArray } from 'drizzle-orm'

export async function getEnvironmentName(environmentId: number, teamId: number): Promise<string> {
  const environment = await db.query.environments.findFirst({
    where: and(
      eq(schema.environments.id, environmentId),
      eq(schema.environments.teamId, teamId),
    ),
  })
  if (!environment) {
    throw createError({ statusCode: 404, statusMessage: 'Environment not found' })
  }
  return environment.name
}

export function assertPushAllowedForEnvironment(
  environmentName: string,
  syncPolicy: ShelveSyncConfig | null | undefined,
): void {
  const policy = resolveSyncPolicy(environmentName, syncPolicy ?? undefined)
  if (!policy.allowPush) {
    throw createError({
      statusCode: 403,
      statusMessage: 'ENV_PROTECTED',
      message: `Push to "${environmentName}" is blocked by project sync policy.`,
    })
  }
}

export async function assertPushAllowedForEnvironmentIds(
  environmentIds: number[],
  teamId: number,
  syncPolicy: ShelveSyncConfig | null | undefined,
): Promise<void> {
  const uniqueIds = [...new Set(environmentIds)]
  if (uniqueIds.length === 0) return

  const environments = await db.query.environments.findMany({
    where: and(
      eq(schema.environments.teamId, teamId),
      inArray(schema.environments.id, uniqueIds),
    ),
  })

  if (environments.length !== uniqueIds.length) {
    throw createError({ statusCode: 404, statusMessage: 'Environment not found' })
  }

  for (const environment of environments) {
    assertPushAllowedForEnvironment(environment.name, syncPolicy)
  }
}
