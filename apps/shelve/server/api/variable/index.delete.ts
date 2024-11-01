import type { H3Event } from 'h3'
import { deleteVariables } from '~~/server/services/variable.service'

export default defineEventHandler(async (event: H3Event) => {
  const { user } = event.context
  const body = await readBody(event)
  const variablesId = body.variables
  await deleteVariables(variablesId, user)
  return {
    statusCode: 200,
    message: 'Variables deleted',
  }
})
