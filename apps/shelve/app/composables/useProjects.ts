import type { CreateProjectInput, Project } from '@shelve/types'

export function useProjectsService() {
  const route = useRoute()
  const projectId = route.params.projectId as string
  const teamSlug = route.params.teamSlug as string
  const projects = useProjects(teamSlug)
  const currentProject = useProject(projectId)

  const loading = ref(false)
  const currentLoading = ref(false)
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
    currentProject.value = await $fetch<Project>(`/api/teams/${teamSlug}/projects/${projectId}`, {
      method: 'GET',
    })
    currentLoading.value = false
  }

  async function createProject(input: Omit<CreateProjectInput, 'teamId'>) {
    try {
      if (input.repository) {
        if (!input.repository.startsWith('https://github.com/')) {
          toast.error('Shelve only supports GitHub repositories')
          return
        }
        input.repository = input.repository.replace('https://github.com/', '')
      }
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

  async function updateProject(project: Project) {
    updateLoading.value = true
    try {
      if (project.repository) {
        if (!project.repository.startsWith('https://github.com/')) {
          toast.error('Shelve only supports GitHub repositories')
          return
        }
        project.repository = project.repository.replace('https://github.com/', '')
      }
      const response = await $fetch<Project>(`/api/teams/${teamSlug}/projects/${project.id}`, {
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
