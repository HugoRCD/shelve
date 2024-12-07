import type { CreateProjectInput, Project } from '@shelve/types'

/**
 * All current team projects (load on the '/' route)
 */
export function useProjects(teamSlug: string) {
  return useState<Project[]>(`${teamSlug}-projects`)
}

/**
 * Current selected project (active project context)
 * Only available on route under '/projects/:projectId'
 */
export function useProject(projectId: number) {
  return useState<Project>(`project-${projectId}`)
}

export function useProjectsService() {
  const route = useRoute()
  const projectId = route.params.projectId as string
  const teamSlug = route.params.teamSlug as string
  const projects = useProjects(teamSlug)
  const currentProject = useProject(+projectId)
  const teamId = useCookie<number>('defaultTeamId')

  const loading = ref(false)
  const currentLoading = ref(false)
  const updateLoading = ref(false)

  async function fetchProjects() {
    loading.value = true
    projects.value = await $fetch<Project[]>(`/api/teams/${teamId.value}/projects`, {
      method: 'GET',
    })
    loading.value = false
  }

  async function fetchCurrentProject(projectId: number) {
    if (currentProject.value) return
    currentLoading.value = true
    currentProject.value = await $fetch<Project>(`/api/teams/${teamId.value}/projects/${projectId}`, {
      method: 'GET',
    })
    currentLoading.value = false
  }

  async function createProject(input: Omit<CreateProjectInput, 'teamId'>) {
    try {
      const project = await $fetch<Project>(`/api/teams/${teamId.value}/projects`, {
        method: 'POST',
        body: input
      })
      projects.value.push(project)
      toast.success('Project created')
    } catch (error) {
      console.error(error)
      toast.error('Failed to create project')
    }
  }

  async function updateProject(project: Project) {
    updateLoading.value = true
    try {
      const response = await $fetch<Project>(`/api/teams/${teamId.value}/projects/${project.id}`, {
        method: 'PUT',
        body: project,
      })
      const index = projects.value.findIndex((_project) => _project.id === project.id)
      projects.value.splice(index, 1, response)
      toast.success('Project updated')
    } catch (error) {
      toast.error('Failed to update project')
    }
    updateLoading.value = false
  }

  async function deleteProject() {
    try {
      await $fetch(`/api/teams/${teamId.value}/projects/${currentProject.value.id}`, {
        method: 'DELETE',
      })
      projects.value = projects.value.filter((_project) => _project.id !== currentProject.value.id)
      toast.success('Project deleted')
    } catch (error) {
      toast.error('Failed to delete project')
    }
  }

  return {
    projects,
    loading,
    updateLoading,
    currentLoading,
    currentProject,
    fetchProjects,
    fetchCurrentProject,
    createProject,
    updateProject,
    deleteProject,
  }
}
