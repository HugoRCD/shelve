import type { VariablesCreateInput } from '@shelve/types'
import type { H3Event } from 'h3'
import { upsertVariable } from '~~/server/services/variable.service'
import { getProjectById } from '~~/server/services/project.service'

export default eventHandler(async (event: H3Event) => {
  const variablesCreateInput = await readBody(event) as VariablesCreateInput
  const project = await getProjectById(variablesCreateInput.projectId)
  if (!project) throw createError({ statusCode: 400, statusMessage: 'Project not found' })
  return await upsertVariable(variablesCreateInput)
})
