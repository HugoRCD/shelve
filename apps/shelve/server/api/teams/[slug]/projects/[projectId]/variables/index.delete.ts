import { z } from 'zod'
import { VariablesService } from '~~/server/services/variables'

export default defineEventHandler(async (event) => {
  const { variables } = await readValidatedBody(event, z.object({
    variables: z.array(z.number()).min(1).max(100),
  }).parse)
  await Promise.all(variables.map(id => new VariablesService(event).deleteVariable(id)))
  return {
    statusCode: 200,
    message: 'Variables deleted',
  }
})
