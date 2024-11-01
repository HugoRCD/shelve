import type { H3Event } from 'h3'
import { ProjectService } from '~~/server/services/project.service'

export default defineEventHandler(async (event: H3Event) => {
  const id = getRouterParam(event, 'id') as string
  const teamId = getRouterParam(event, 'teamId') as string
  if (!id || !teamId) throw createError({ statusCode: 400, statusMessage: 'Missing params' })
  const projectService = new ProjectService()
  await projectService.removeTeamFromProject(+id, +teamId)
  return {
    statusCode: 200,
    message: 'Team removed from project',
  }
})
