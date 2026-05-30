import { resolveSyncPolicy, type ShelveSyncConfig } from '@types'

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
  for (const environmentId of environmentIds) {
    const name = await getEnvironmentName(environmentId, teamId)
    assertPushAllowedForEnvironment(name, syncPolicy)
  }
}
