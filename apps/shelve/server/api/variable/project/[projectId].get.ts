import { zh, z } from 'h3-zod'
import { VariableService } from '~~/server/services/variable.service'

export default eventHandler(async (event) => {
  const { projectId } = await zh.useValidatedParams(event, {
    projectId: z.string({
      required_error: 'projectId is required',
    }).transform((value) => parseInt(value, 10)),
  })
  return await new VariableService().getVariablesByProjectId(projectId)
})
