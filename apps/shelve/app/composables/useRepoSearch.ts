import type { GitHubRepo } from '@types'

export function useRepoSearch() {
  const searchTerm = ref('')
  
  function filterRepos(repos: GitHubRepo[], search: string) {
    if (!search) return repos
    const searchLower = search.toLowerCase()
    return repos.filter(repo => 
      repo.name.toLowerCase().includes(searchLower) || 
      repo.full_name.toLowerCase().includes(searchLower)
    )
  }
  
  function formatRepos(repos: GitHubRepo[], onSelect: (repo: GitHubRepo) => void) {
    return repos.map(repo => ({
      id: repo.id,
      label: repo.name,
      suffix: repo.html_url,
      onSelect: () => onSelect(repo)
    }))
  }
  
  return {
    searchTerm,
    filterRepos,
    formatRepos
  }
} 
