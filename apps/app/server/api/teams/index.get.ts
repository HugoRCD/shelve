import { H3Event } from 'h3'
import { getTeamByUserId } from '~~/server/app/teamsService'

export default eventHandler((event: H3Event) => {
  const { user } = event.context
  return getTeamByUserId(user.id)
})
