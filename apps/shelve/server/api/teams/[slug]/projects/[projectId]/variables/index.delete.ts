import { z } from 'zod'

export default eventHandler(async (event) => {
  const { variables } = await readValidatedBody(event, z.object({
    variables: z.array(z.number()).min(1).max(100),
  }).parse)
  const variablesService = new VariablesService(event)
  await Promise.all(variables.map(id => variablesService.deleteVariable(id)))
  return {
    statusCode: 200,
    message: 'Variables deleted',
  }
})
