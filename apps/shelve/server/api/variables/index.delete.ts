import { zh, z } from 'h3-zod'
import { VariablesService } from '~~/server/services/variables'

export default defineEventHandler(async (event) => {
  const { variables } = await zh.useValidatedBody(event, {
    variables: z.array(z.number()).min(1).max(100),
  })
  await Promise.all(variables.map(id => new VariablesService().deleteVariable(id)))
  return {
    statusCode: 200,
    message: 'Variables deleted',
  }
})
