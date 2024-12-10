export default defineNuxtRouteMiddleware(((to) => {
  const projectId = to.params.projectId as string|| ''
  const teamSlug = to.params.teamSlug as string || ''
  if (projectId && teamSlug && to.path.startsWith(`/${teamSlug}/projects/${projectId}`)) {
    const userProjects = useProjects(teamSlug)
    const currentProject = useProject(+projectId)
    if (!userProjects.value) return
    const project = userProjects.value.find((project) => project.id === +projectId)
    if (project) {
      currentProject.value = project
    }
  }
}))
