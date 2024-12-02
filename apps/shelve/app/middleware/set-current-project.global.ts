export default defineNuxtRouteMiddleware(((to) => {
  const userProjects = useProjects()
  const currentProject = useProject()
  const projectId = to.params.projectId || ''
  const teamSlug = to.params.teamSlug || ''
  if (to.path === `/${teamSlug}/projects/${projectId}`) {
    const project = userProjects.value.find((project) => project.id === parseInt(projectId as string))
    if (project) {
      currentProject.value = project
    }
  }
}))
