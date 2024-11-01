import type { H3Event } from 'h3'
import { getTeamByUserId } from '~~/server/services/teams.service'

export default eventHandler((event: H3Event) => {
  const { user } = event.context
  return getTeamByUserId(user.id)
})
