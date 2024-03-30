import { H3Event } from 'h3'
import { getProjectsByUserId } from '~/server/app/projectService'

export default eventHandler(async (event: H3Event) => {
  const user = event.context.user
  return await getProjectsByUserId(user.id)
})
