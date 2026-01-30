export default defineNuxtRouteMiddleware(async (to, from) => {
  if (to.path !== '/') return
  if (from.path && from.path !== '/') return

  const teams = await $fetch('/api/teams')
  if (teams.length === 1) {
    return navigateTo(`/${teams[0].slug}`)
  }
})
