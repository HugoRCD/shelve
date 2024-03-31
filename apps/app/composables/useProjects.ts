import type { CreateProjectInput, Project } from '@shelve/types'

export const useUserProjects = () => {
  return useState<Project[]>('projects')
}

export function useProjects() {
  const projects = useUserProjects()
  const loading = ref(false)

  async function fetchProjects() {
    loading.value = true
    projects.value = await $fetch<Project[]>('/api/project', {
      method: 'GET',
    })
    loading.value = false
  }

  async function createProject(createProjectInput: CreateProjectInput) {
    try {
      const response = await $fetch<Project>('/api/project', {
        method: 'POST',
        body: createProjectInput,
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
    loading,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
  }
}
