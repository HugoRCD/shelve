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
export function useProject(): Ref<Project> {
  return useState<Project>('currentProject')
}

export function useProjectId(): Ref<string> {
  const route = useRoute()
  return computed(() => route.params.projectId as string)
}

export function useProjectsService() {
  const projects = useProjects()
  const currentProject = useProject()
  const teamId = useTeamId()
  const projectId = useProjectId()
  const baseUrl = computed(() => `/api/teams/${teamId.value}/projects`)

  const loading = ref(false)
  const currentLoading = ref(false)
  const updateLoading = ref(false)

  async function fetchProjects() {
    loading.value = true
    projects.value = await $fetch<Project[]>(`${baseUrl.value}`, {
      method: 'GET',
    })
    loading.value = false
  }

  async function fetchCurrentProject() {
    if (currentProject.value) return
    currentLoading.value = true
    currentProject.value = await $fetch<Project>(`${baseUrl.value}/${projectId.value}`, {
      method: 'GET',
    })
    currentLoading.value = false
  }

  async function createProject(createProjectInput: Omit<CreateProjectInput, 'teamId'>) {
    try {
      const response = await $fetch<Project>(`${baseUrl.value}`, {
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

  async function updateProject(project: Project) {
    updateLoading.value = true
    try {
      const response = await $fetch<Project>(`${baseUrl.value}/${project.id}`, {
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

  async function deleteProject(projectId: number) {
    try {
      await $fetch(`${baseUrl.value}/${projectId}`, {
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
