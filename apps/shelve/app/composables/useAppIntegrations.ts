import type { BaseIntegration } from '@types'

interface Integration extends BaseIntegration {
  installationId?: number // For GitHub
  configurationId?: string // For Vercel
}

interface VercelProject {
  id: string
  name: string
  createdAt: number
  framework?: string
  link?: string
}

interface AppIntegrations {
  github: Integration[]
  vercel: Integration[]
  vercelProjects: VercelProject[]
  loading: boolean
  projectsLoading: boolean
  lastFetch: number | null
  lastProjectsFetch: number | null
}

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function useAppIntegrations() {
  const integrations = useState<AppIntegrations>('app-integrations', () => ({
    github: [],
    vercel: [],
    vercelProjects: [],
    loading: false,
    projectsLoading: false,
    lastFetch: null,
    lastProjectsFetch: null
  }))

  const needsRefresh = computed(() => {
    if (!integrations.value.lastFetch) return true
    return Date.now() - integrations.value.lastFetch > CACHE_DURATION
  })

  const needsProjectsRefresh = computed(() => {
    if (!integrations.value.lastProjectsFetch) return true
    return Date.now() - integrations.value.lastProjectsFetch > CACHE_DURATION
  })

  async function fetchAllIntegrations(force = false): Promise<void> {
    if (!force && !needsRefresh.value && integrations.value.lastFetch) {
      return
    }

    if (integrations.value.loading) return

    integrations.value.loading = true

    try {
      const [githubData, vercelData] = await Promise.all([
        $fetch<Integration[]>('/api/integrations/github').catch(() => []),
        $fetch<Integration[]>('/api/integrations/vercel').catch(() => [])
      ])

      integrations.value.github = githubData
      integrations.value.vercel = vercelData
      integrations.value.lastFetch = Date.now()
    } catch (error) {
      console.error('Error fetching integrations:', error)
    } finally {
      integrations.value.loading = false
    }
  }

  async function fetchVercelProjects(force = false): Promise<VercelProject[]> {
    if (!force && !needsProjectsRefresh.value && integrations.value.lastProjectsFetch) {
      return integrations.value.vercelProjects
    }

    if (integrations.value.projectsLoading) return integrations.value.vercelProjects

    integrations.value.projectsLoading = true

    try {
      const projects = await $fetch<VercelProject[]>('/api/vercel/projects')
      integrations.value.vercelProjects = projects
      integrations.value.lastProjectsFetch = Date.now()
      return projects
    } catch (error) {
      console.error('Error fetching Vercel projects:', error)
      return integrations.value.vercelProjects
    } finally {
      integrations.value.projectsLoading = false
    }
  }

  function getIntegrations(type: 'github' | 'vercel'): Integration[] {
    return integrations.value[type] || []
  }

  function hasIntegration(type: 'github' | 'vercel'): boolean {
    return getIntegrations(type).length > 0
  }

  function getVercelProjects(): VercelProject[] {
    return integrations.value.vercelProjects
  }

  function clearCache(): void {
    integrations.value = {
      github: [],
      vercel: [],
      vercelProjects: [],
      loading: false,
      projectsLoading: false,
      lastFetch: null,
      lastProjectsFetch: null
    }
  }

  if (needsRefresh.value) {
    fetchAllIntegrations()
  }

  return {
    integrations: readonly(integrations),
    fetchAllIntegrations,
    fetchVercelProjects,
    getIntegrations,
    hasIntegration,
    getVercelProjects,
    clearCache,
    loading: computed(() => integrations.value.loading),
    projectsLoading: computed(() => integrations.value.projectsLoading)
  }
} 
