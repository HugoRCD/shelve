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

export default eventHandler(async (event) => {
  const { team, project } = await requireUserTeamProject(event, { minRole: TeamRole.ADMIN })
  const body = await readValidatedBody(event, updateProjectSchema.parse)

  return await new ProjectsService().updateProject({
    id: project.id,
    ...body,
    teamId: team.id,
  })
})
