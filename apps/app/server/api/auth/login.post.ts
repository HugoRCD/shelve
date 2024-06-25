import { H3Event } from 'h3'
import { formatUser } from '~~/server/database/client'
import { login } from '~~/server/app/authService'

export default eventHandler(async (event: H3Event) => {
  const body = await readBody(event)
  body.authToken = getCookie(event, 'authToken') || ''
  const { user, authToken } = await login(body)
  setCookie(event, 'authToken', authToken, {
    httpOnly: true,
    secure: true,
    path: '/',
    maxAge: 1000 * 60 * 60 * 24 * 7,
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
