import { z, zh } from 'h3-zod'
import type { ProjectUpdateInput } from '@shelve/types'
import { ProjectService } from '~~/server/services/project.service'

export default eventHandler(async (event) => {
  const { id } = await zh.useValidatedParams(event, {
    id: z.string({
      required_error: 'Project ID is required',
    }).transform((value) => parseInt(value, 10)),
  })
  const body = await zh.useValidatedBody(event, {
    name: z.string({
      required_error: 'Project name is required',
    }).min(1).max(255).trim(),
    description: z.string().optional(),
    logo: z.string().optional(),
    teamId: z.number({
      required_error: 'Team ID is required',
    }).positive(),
  })
  const { user } = event.context
  const input: ProjectUpdateInput = {
    id: id,
    name: body.name,
    description: body.description,
    logo: body.logo,
    teamId: body.teamId,
    requester: {
      id: user.id,
      role: user.role,
    }
  }
  return new ProjectService().updateProject(input)
})
