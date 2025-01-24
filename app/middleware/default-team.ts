export default defineNuxtRouteMiddleware(() => {
  const defaultTeamSlug = useCookie<string>('defaultTeamSlug')
  if (!defaultTeamSlug.value) return navigateTo('/')
})
