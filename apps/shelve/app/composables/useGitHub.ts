import type { GitHubRepo } from '@types'

export function useGitHub() {
  const query = ref('')

  const { data: apps, status: appsStatus } = useAsyncData('user-apps', () => $fetch('/api/github/apps', {
    method: 'GET'
  }))

  const { data: repos, status: reposStatus, refresh: refreshRepos } = useFetch<{
    data: GitHubRepo[]
  }>('/api/github/repos', {
    params: { q: query },
    dedupe: 'defer',
    immediate: false
  })

  const reposLoading = computed(() => reposStatus.value === 'pending')
  const appsLoading = computed(() => appsStatus.value === 'pending')
  const loading = computed(() => reposLoading.value || appsLoading.value)

  return {
    apps,
    repos,
    query,
    loading,
    reposLoading,
    appsLoading,
    refreshRepos
  }
}
