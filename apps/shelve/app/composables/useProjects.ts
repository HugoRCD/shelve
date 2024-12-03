import type { CreateProjectInput, Project } from '@shelve/types'

/**
 * All current team projects (load on the '/' route)
 */
export function useProjects() {
  return useState<Project[]>('projects', () => [])
}

/**
 * Current selected project (active project context)
 * Only available on route under '/projects/:projectId'
 */
export function useProject() {
  return useState<Project | null>('currentProject', () => null)
}

export function useProjectsService() {
  const projects = useProjects()
  const currentProject = useProject()
  const teamId = useTeamId()

  const loading = ref(false)
  const currentLoading = ref(false)

  async function fetchProjects() {
    loading.value = true
    projects.value = await $fetch<Project[]>(`/api/teams/${teamId.value}/projects`, {
      method: 'GET',
    })
    loading.value = false
  }

  async function fetchCurrentProject(projectId: number) {
    currentLoading.value = true
    currentProject.value = await $fetch<Project>(`/api/teams/${teamId.value}/projects/${projectId}`, {
      method: 'GET',
    })
    currentLoading.value = false
  }

  async function createProject(createProjectInput: Omit<CreateProjectInput, 'teamId'>) {
    try {
      const response = await $fetch<Project>(`/api/teams/${teamId.value}/projects${teamId.value ? `?teamId=${teamId.value}` : ''}`, {
        method: 'POST',
        body: {
          ...createProjectInput
        }
      })
      projects.value.push(response)
      toast.success('Project created')
    } catch (error) {
      toast.error('Failed to create project')
    }
  }

  async function updateProject(projectId: number, project: Project) {
    try {
      const response = await $fetch<Project>(`/api/teams/${teamId.value}/projects/${projectId}`, {
        method: 'PUT',
        body: project,
      })
      const index = projects.value.findIndex((project) => project.id === projectId)
      projects.value.splice(index, 1, response)
      toast.success('Project updated')
    } catch (error) {
      toast.error('Failed to update project')
    }
  }

  async function deleteProject(projectId: number) {
    try {
      await $fetch(`/api/teams/${teamId.value}/projects/${projectId}`, {
        method: 'DELETE',
      })
      projects.value = projects.value.filter((project) => project.id !== projectId)
      toast.success('Project deleted')
    } catch (error) {
      toast.error('Failed to delete project')
    }
  }

  return {
    projects,
    loading,
    currentLoading,
    currentProject,
    fetchProjects,
    fetchCurrentProject,
    createProject,
    updateProject,
    deleteProject,
  }
}
