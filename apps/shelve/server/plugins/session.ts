export default defineNitroPlugin(() => {
  sessionHooks.hook('clear', (session, event) => {
    deleteCookie(event, 'defaultTeamSlug')
  })
})
