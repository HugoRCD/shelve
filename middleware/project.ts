export default defineNuxtRouteMiddleware(((to, from) => {
  const projectId = to.params.projectId || from.params.projectId || ''
  if (to.path === `/app/project/${projectId}`) {
    return `/app/project/${projectId}/variables`
  }
}))
