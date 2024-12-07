export default defineNuxtRouteMiddleware(() => {
  const defaultTeamId = useCookie<number>('defaultTeamId')
  if (!defaultTeamId.value) return navigateTo('/')
})
