export default defineNuxtRouteMiddleware(((to, from) => {
  const projectId = to.params.projectId || from.params.projectId || ''
  if (to.path === `/project/${projectId}`) {
    return `/project/${projectId}/variables`
  }
}))
