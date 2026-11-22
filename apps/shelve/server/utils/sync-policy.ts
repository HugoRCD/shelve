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

/**
 * The policy with environment `from` renamed to `to`, so a protected environment stays protected
 * after a rename. Returns the same object when the policy doesn't mention `from`.
 */
export function renameEnvironmentInSyncPolicy(
  policy: ShelveSyncConfig | null,
  from: string,
  to: string,
): ShelveSyncConfig | null {
  const inEnvironments = !!policy?.environments && Object.hasOwn(policy.environments, from)
  const inProtected = !!policy?.protectedEnvironments?.includes(from)
  if (!policy || (!inEnvironments && !inProtected)) return policy

  const renamed: ShelveSyncConfig = { ...policy }
  if (inEnvironments) {
    const { [from]: environmentPolicy, ...others } = policy.environments!
    renamed.environments = { ...others, [to]: environmentPolicy! }
  }
  if (inProtected) {
    renamed.protectedEnvironments = [...new Set(policy.protectedEnvironments!.map(name => name === from ? to : name))]
  }
  return renamed
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

/**
 * Refuses the write when any of the environments is protected by the project's sync policy.
 * The policy is read from the database, not the project cache, so a change applies to the next push.
 */
export async function assertPushAllowedForEnvironmentIds(
  environmentIds: number[],
  teamId: number,
  projectId: number,
): Promise<void> {
  const uniqueIds = [...new Set(environmentIds)]
  if (uniqueIds.length === 0) return

  const project = await db.query.projects.findFirst({
    where: and(eq(schema.projects.id, projectId), eq(schema.projects.teamId, teamId)),
    columns: { syncPolicy: true },
  })
  if (!project) throw createError({ statusCode: 404, statusMessage: 'Project not found' })
  const { syncPolicy } = project

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
