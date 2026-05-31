export type ScopeLabels = {
  teams: Record<number, string>
  projects: Record<number, string>
  environments: Record<number, string>
}

export function useScopeLabels() {
  const scopeLabels = useState<ScopeLabels | null>('scope-labels', () => null)

  async function fetchScopeLabels() {
    if (scopeLabels.value) return scopeLabels.value
    scopeLabels.value = await $fetch<ScopeLabels>('/api/user/scope-labels')
    return scopeLabels.value
  }

  function teamName(id: number): string {
    return scopeLabels.value?.teams[id] ?? `team #${id}`
  }

  function projectName(id: number): string {
    return scopeLabels.value?.projects[id] ?? `project #${id}`
  }

  function environmentName(id: number): string {
    return scopeLabels.value?.environments[id] ?? `env #${id}`
  }

  return {
    scopeLabels,
    fetchScopeLabels,
    teamName,
    projectName,
    environmentName,
  }
}
