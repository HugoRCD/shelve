export default defineNitroPlugin(() => {
  sessionHooks.hook('clear', (session, event) => {
    setCookie(event, 'lastUsedTeam', '')
  })
})
