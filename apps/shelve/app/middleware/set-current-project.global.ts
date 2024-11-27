export default defineNuxtRouteMiddleware(((to) => {
  const userProjects = useProjects()
  const currentProject = useProject()
  const projectId = to.params.projectId || ''
  if (to.path === `/projects/${projectId}`) {
    const project = userProjects.value.find((project) => project.id === parseInt(projectId as string))
    if (project) {
      currentProject.value = project
    }
  }
}))
