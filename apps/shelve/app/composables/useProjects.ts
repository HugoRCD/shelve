import type { CreateProjectInput, Project } from '@shelve/types'

export const useUserProjects = () => {
  return useState<Project[]>('projects', () => [])
}

export const useCurrentProject = () => {
  return useState<Project>('currentProject')
}

export function useProjects() {
  const projects = useUserProjects()
  const currentProject = useCurrentProject()
  const teamId = useTeamId()

  const loading = ref(false)
  const currentLoading = ref(false)

  async function fetchProjects() {
    loading.value = true
    projects.value = await $fetch<Project[]>(`/api/teams/projects${teamId.value ? `?teamId=${teamId.value}` : ''}`, {
      method: 'GET',
    })
    loading.value = false
  }

  async function fetchCurrentProject(projectId: number) {
    currentLoading.value = true
    currentProject.value = await $fetch<Project>(`/api/project/${projectId}`, {
      method: 'GET',
    })
    currentLoading.value = false
  }

  async function createProject(createProjectInput: Omit<CreateProjectInput, 'teamId'>) {
    try {
      const response = await $fetch<Project>('/api/project', {
        method: 'POST',
        body: {
          ...createProjectInput,
          teamId: teamId.value,
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
      const response = await $fetch<Project>(`/api/project/${projectId}`, {
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
      await $fetch(`/api/project/${projectId}`, {
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
    currentProject,
    loading,
    currentLoading,
    fetchProjects,
    fetchCurrentProject,
    createProject,
    updateProject,
    deleteProject,
  }
}
