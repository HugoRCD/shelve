export default defineNuxtRouteMiddleware(((to) => {
  const userProjects = useUserProjects()
  const currentProject = useCurrentProject()
  const projectId = to.params.projectId || ''
  if (to.path === `/project/${projectId}`) {
    const project = userProjects.value.find((project) => project.id === parseInt(projectId as string))
    if (project) {
      currentProject.value = project
    }
  }
}))
