export default defineNuxtRouteMiddleware(async (to, from) => {
  if (to.path !== '/') return

  // Skip redirect if coming from another internal page (not a fresh navigation)
  if (from.path && from.path !== '/' && !from.path.startsWith('/auth')) return

  try {
    const teams = await $fetch<Array<{ slug: string }>>('/api/teams')
    if (teams?.length === 1) {
      return navigateTo(`/${teams[0]?.slug}`)
    }
  } catch (error) {
    console.error('Failed to fetch teams in index-redirect middleware:', error)
  }
})
