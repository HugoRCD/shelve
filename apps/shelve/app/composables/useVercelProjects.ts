import type { Project } from '@types'

interface VercelProject {
  id: string
  name: string
  createdAt: number
  framework?: string
  link?: string
}

export function useVercelProjects() {
  const loading = ref(false)
  const initialLoading = ref(false)
  const projects = ref<VercelProject[]>([])
  const lastFetch = ref<number | null>(null)
  const CACHE_DURATION = 5 * 60 * 1000

  async function fetchVercelProjects(force = false): Promise<VercelProject[]> {
    const now = Date.now()
    
    if (!force && projects.value.length > 0 && lastFetch.value && (now - lastFetch.value) < CACHE_DURATION) {
      return projects.value
    }
    
    if (projects.value.length === 0) {
      initialLoading.value = true
    } else {
      loading.value = true
    }
    
    try {
      const data = await $fetch<VercelProject[]>('/api/vercel/projects')
      projects.value = data
      lastFetch.value = now
      return data
    } catch (error: any) {
      console.error('Error fetching Vercel projects:', error)
      if (error.statusCode !== 404) {
        toast.error('Failed to fetch Vercel projects', {
          description: error.message || 'Please check your Vercel integration'
        })
      }
      return []
    } finally {
      loading.value = false
      initialLoading.value = false
    }
  }

  async function linkProjectToVercel(projectId: number, vercelProjectId: string): Promise<Project | null> {
    try {
      const updatedProject = await $fetch<Project>(`/api/teams/${useRoute().params.teamSlug}/projects/${projectId}`, {
        method: 'PUT',
        body: { vercelProjectId }
      })
      
      toast.success('Project linked to Vercel successfully', {
        duration: 3000
      })
      
      return updatedProject
    } catch (error: any) {
      console.error('Error linking project to Vercel:', error)
      toast.error('Failed to link project', {
        description: error.message || 'Please try again'
      })
      return null
    }
  }

  async function unlinkProjectFromVercel(projectId: number): Promise<Project | null> {
    try {
      const updatedProject = await $fetch<Project>(`/api/teams/${useRoute().params.teamSlug}/projects/${projectId}`, {
        method: 'PUT',
        body: { vercelProjectId: null }
      })
      
      toast.success('Project unlinked from Vercel', {
        duration: 3000
      })
      
      return updatedProject
    } catch (error: any) {
      console.error('Error unlinking project from Vercel:', error)
      toast.error('Failed to unlink project', {
        description: error.message || 'Please try again'
      })
      return null
    }
  }

  function getLinkedVercelProject(project: Project): VercelProject | undefined {
    if (!project.vercelProjectId) return undefined
    return projects.value.find(vp => vp.id === project.vercelProjectId)
  }

  function isProjectLinked(project: Project): boolean {
    return !!project.vercelProjectId && !!getLinkedVercelProject(project)
  }

  function getFrameworkIcon(framework?: string): string {
    if (!framework) return 'i-simple-icons-vercel'
    
    const frameworkMap: Record<string, string> = {
      'nextjs': 'i-simple-icons-nextdotjs',
      'nuxtjs': 'i-simple-icons-nuxtdotjs', 
      'vue': 'i-simple-icons-vuedotjs',
      'react': 'i-simple-icons-react',
      'angular': 'i-simple-icons-angular',
      'svelte': 'i-simple-icons-svelte',
      'sveltekit': 'i-simple-icons-svelte',
      'gatsby': 'i-simple-icons-gatsby',
      'vite': 'i-simple-icons-vite',
      'astro': 'i-simple-icons-astro',
      'remix': 'i-simple-icons-remix',
      'vanilla': 'i-simple-icons-javascript'
    }
    
    return frameworkMap[framework.toLowerCase()] || 'i-simple-icons-vercel'
  }

  function clearCache() {
    projects.value = []
    lastFetch.value = null
    initialLoading.value = false
  }

  function refreshProjects() {
    return fetchVercelProjects(true)
  }

  return {
    loading: readonly(loading),
    initialLoading: readonly(initialLoading),
    projects: readonly(projects),
    fetchVercelProjects,
    linkProjectToVercel,
    unlinkProjectFromVercel,
    getLinkedVercelProject,
    isProjectLinked,
    getFrameworkIcon,
    clearCache,
    refreshProjects
  }
} 
