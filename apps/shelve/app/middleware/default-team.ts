export default defineNuxtRouteMiddleware(() => {
  const defaultTeamId = useCookie<number>('defaultTeamId', {
    watch: true,
  })
  if (!defaultTeamId.value) return navigateTo('/')
})
