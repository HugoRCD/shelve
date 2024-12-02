export default defineNuxtRouteMiddleware(((to, from) => {
  const projectId = to.params.projectId || from.params.projectId || ''
  const teamSlug = to.params.teamSlug || from.params.teamSlug || ''
  if (to.path === `/${teamSlug}/projects/${projectId}`) {
    return `/${teamSlug}/projects/${projectId}/variables`
  }
}))
