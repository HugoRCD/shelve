import type { VariablesCreateInput } from '@shelve/types'
import type { H3Event } from 'h3'
import { VariableService } from '~~/server/services/variable.service'
import { ProjectService } from '~~/server/services/project.service'

export default eventHandler(async (event: H3Event) => {
  const variableService = new VariableService()
  const projectService = new ProjectService()
  const variablesCreateInput = await readBody(event) as VariablesCreateInput
  const project = await projectService.getProjectById(variablesCreateInput.projectId, event.context.user.id)
  if (!project) throw createError({ statusCode: 400, statusMessage: 'Project not found' })
  return await variableService.upsertVariable(variablesCreateInput)
})
