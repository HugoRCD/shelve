import type { Project } from '@types'
import type { CreateProjectSchema, UpdateProjectSchema } from '~/utils/zod/project'

export const useCurrentLoading = () => {
  return useState<boolean>('currentLoading', () => false)
}

export function useProjectsService() {
  const route = useRoute()
  const projectId = route.params.projectId as string
  const teamSlug = route.params.teamSlug as string
  const projects = useProjects(teamSlug)
  const currentProject = useProject(projectId)

  const loading = ref(false)
  const currentLoading = useCurrentLoading()
  const updateLoading = ref(false)

  async function fetchProjects() {
    loading.value = true
    projects.value = await $fetch<Project[]>(`/api/teams/${teamSlug}/projects`, {
      method: 'GET',
    })
    loading.value = false
  }

  async function fetchCurrentProject(projectId: number) {
    if (currentProject.value) return
    currentLoading.value = true
    try {
      currentProject.value = await $fetch<Project>(`/api/teams/${teamSlug}/projects/${projectId}`, {
        method: 'GET',
      })
    } catch (error) {
      console.error('Error fetching project data:', error)
    } finally {
      currentLoading.value = false
    }
  }

  async function createProject(input: CreateProjectSchema) {
    try {
      const project = await $fetch<Project>(`/api/teams/${teamSlug}/projects`, {
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

  async function updateProject(project: UpdateProjectSchema) {
    updateLoading.value = true
    try {
      const _project = await $fetch<Project>(`/api/teams/${teamSlug}/projects/${project.id}`, {
        method: 'PUT',
        body: project,
      })
      if (projects.value) {
        const index = projects.value.findIndex((_project) => _project.id === project.id)
        projects.value[index] = _project
      }
      toast.success('Project updated')
    } catch (error) {
      console.error(error)
      toast.error('Failed to update project')
    } finally {
      updateLoading.value = false
    }
  }

  async function deleteProject() {
    try {
      await $fetch(`/api/teams/${teamSlug}/projects/${currentProject.value.id}`, {
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
