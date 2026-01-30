export default defineNuxtRouteMiddleware((to, from) => {
  if (to.path !== '/') return

  // If navigating from another page (in-app navigation), allow it
  if (from.path && from.path !== '/') return

  const defaultTeamSlug = useCookie<string>('defaultTeamSlug')
  if (defaultTeamSlug.value) {
    return navigateTo(`/${defaultTeamSlug.value}`)
  }
})
