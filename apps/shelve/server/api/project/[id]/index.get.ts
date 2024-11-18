import { z, zh } from 'h3-zod'
import { ProjectService } from '~~/server/services/project.service'

export default eventHandler(async (event) => {
  const { id } = await zh.useValidatedParams(event, {
    id: z.string({
      required_error: 'Project id is required',
    }).transform((value) => parseInt(value, 10)),
  })
  return await new ProjectService().getProjectById(id, event.context.user.id)
})
