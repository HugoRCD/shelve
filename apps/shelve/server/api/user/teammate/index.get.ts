import { H3Event } from 'h3'
import { getTeammatesByUserId } from '~~/server/app/teammateService'

export default eventHandler((event: H3Event) => {
  const { user } = event.context
  return getTeammatesByUserId(user.id)
})
