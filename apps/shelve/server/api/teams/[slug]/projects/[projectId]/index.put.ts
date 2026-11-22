import { isDeepStrictEqual } from 'node:util'
import { z } from 'zod'
import { TeamRole } from '@types'
import { shelveSyncConfigSchema } from '~/utils/zod/sync-policy'

const syncPolicySchema = shelveSyncConfigSchema.nullable().optional()

const updateProjectSchema = z.object({
  name: z.string().min(1).max(255).trim(),
  description: z.string().trim().optional(),
  homepage: z.string().trim().optional(),
  projectManager: z.string().trim().optional(),
  variablePrefix: z.string().trim().optional(),
  repository: z.string().trim().optional(),
  logo: z.string().trim().optional(),
  syncPolicy: syncPolicySchema,
})

const blankToNull = (value: unknown) => value === undefined || value === '' ? null : value

export default eventHandler(async (event) => {
  const { team, project } = await requireUserTeamProject(event, { minRole: TeamRole.ADMIN })
  const body = await readValidatedBody(event, updateProjectSchema.parse)

  const updatedProject = await new ProjectsService().updateProject({
    id: project.id,
    ...body,
    teamId: team.id,
  })

  const fields = (Object.keys(body) as (keyof typeof body)[])
    .filter(field => body[field] !== undefined && !isDeepStrictEqual(blankToNull(body[field]), blankToNull(project[field])))
  if (fields.length) {
    await logAudit(event, {
      teamId: team.id,
      action: 'project.update',
      resourceType: 'project',
      resourceId: project.id,
      metadata: {
        projectId: project.id,
        projectName: updatedProject.name,
        fields,
        ...(fields.includes('syncPolicy') && {
          syncPolicy: updatedProject.syncPolicy ?? null,
          previousSyncPolicy: project.syncPolicy ?? null,
        }),
      },
    })
  }

  return updatedProject
})
