import type { GitHubRepo } from '@types'

export function useGitHub() {
  const { data: apps, status: appsStatus } = useAsyncData('github-apps', () => 
    $fetch('/api/github/apps')
  )

  const { data: repos, status: reposStatus, refresh: refreshRepos, error: reposError } = useFetch<GitHubRepo[]>('/api/github/repos', {
    key: 'github-repos',
    server: false,
    immediate: false
  })

  const loading = computed(() => 
    reposStatus.value === 'pending' || appsStatus.value === 'pending'
  )

  return {
    apps,
    repos,
    reposError,
    loading,
    refreshRepos
  }
}
