import type { GitHubRepo } from '@types'

export function useGitHub() {
  const { getIntegrations, hasIntegration } = useAppIntegrations()

  const { data: repos, status: reposStatus, refresh: refreshRepos } = useFetch<GitHubRepo[]>('/api/github/repos', {
    key: 'github-repos',
    server: false,
    immediate: false
  })

  const apps = computed(() => getIntegrations('github'))
  const hasGithubIntegration = computed(() => hasIntegration('github'))

  const loading = computed(() => 
    reposStatus.value === 'pending'
  )

  return {
    apps,
    repos,
    loading,
    refreshRepos,
    hasGithubIntegration
  }
}
