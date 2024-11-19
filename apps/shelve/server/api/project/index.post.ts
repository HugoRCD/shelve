import { z, zh } from 'h3-zod'
import type { CreateProjectInput } from '@shelve/types'
import { ProjectService } from '~~/server/services/project.service'

export default eventHandler(async (event) => {
  const body = await zh.useValidatedBody(event, {
    name: z.string({
      required_error: 'Name is required',
    }).min(1).max(255).trim(),
    teamId: z.number({
      required_error: 'Team ID is required',
    }),
    description: z.string().trim().optional(),
    logo: z.string().trim().optional(),
    repository: z.string().trim().optional(),
    projectManager: z.string().trim().optional(),
    homepage: z.string().trim().optional(),
  })
  const { user } = event.context
  const input: CreateProjectInput = {
    ...body,
    requester: {
      id: user.id,
      role: user.role,
    }
  }
  return await new ProjectService().createProject(input)
})
