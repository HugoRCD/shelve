import { H3Event } from 'h3'
import { getProjectById } from '~/server/app/projectService'

export default eventHandler(async (event: H3Event) => {
  const id = getRouterParam(event, 'id') as string
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing params' })
  return await getProjectById(parseInt(id))
})
