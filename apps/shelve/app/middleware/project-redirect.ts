export default defineNuxtRouteMiddleware(((to, from) => {
  const projectId = to.params.projectId || from.params.projectId || ''
  if (to.path === `/projects/${projectId}`) {
    return `/projects/${projectId}/variables`
  }
}))
