import { H3Event } from 'h3'
import { formatUser } from '~~/server/database/client'
import { login } from '~~/server/app/authService'

export default eventHandler(async (event: H3Event) => {
  const body = await readBody(event)
  body.authToken = getCookie(event, 'authToken') || ''
  const { user } = await login(body)
  await setUserSession(event, {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
    },
    loggedInAt: new Date().toISOString(),
  })
  if (body.deviceInfo?.isCli) {
    const formattedUser = formatUser(user)
    return {
      ...formattedUser,
      authToken,
    }
  }
  return formatUser(user)
})
