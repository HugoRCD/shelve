import { H3Event } from 'h3'
import { deleteVariable } from '~/server/app/variableService'

export default eventHandler(async (event: H3Event) => {
  const id = getRouterParam(event, 'id') as string
  const env = getRouterParam(event, 'env') as string
  if (!id && !env) throw createError({ statusCode: 400, statusMessage: 'Missing params' })
  await deleteVariable(parseInt(id), env)
  return {
    statusCode: 200,
    message: 'User deleted',
  }
})
