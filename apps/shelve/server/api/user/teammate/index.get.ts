import type { H3Event } from 'h3'
import { TeammateService } from '~~/server/services/teammate.service'

export default eventHandler((event: H3Event) => {
  const teammateService = new TeammateService()
  const { user } = event.context
  return teammateService.getTeammatesByUserId(user.id)
})
