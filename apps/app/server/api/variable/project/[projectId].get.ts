import { H3Event } from 'h3'
import { getVariablesByProjectId } from '~/server/app/variableService'

export default eventHandler(async (event: H3Event) => {
  const id = getRouterParam(event, 'projectId') as string
  if (!id) throw createError({ statusCode: 400, statusMessage: 'missing params' })
  return await getVariablesByProjectId(parseInt(id))
})
