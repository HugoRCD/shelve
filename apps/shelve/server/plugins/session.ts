export default defineNitroPlugin(() => {
  sessionHooks.hook('fetch', async (session, event) => {
    if (session.user) return

    const authToken = getCookie(event, 'authToken')
    if (!authToken) return

    const user = await getUserByAuthToken(authToken, event)
    session.user = user
    session.loggedInAt = new Date()
  })

  sessionHooks.hook('clear', (session, event) => {
    deleteCookie(event, 'defaultTeamSlug')
  })
})
