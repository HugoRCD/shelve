import type { Stats, UseStatsOptions } from '@types'

export function useStats(options: UseStatsOptions = {}) {
  const stats = useState<Stats>('stats')
  const isLoading = ref(true)
  const error = ref<string | null>(null)

  async function fetchStats() {
    const baseUrl = options.baseUrl || (typeof window !== 'undefined' ? window.location.origin : '')
    isLoading.value = true
    try {
      stats.value = await $fetch(`${ baseUrl }/api/stats`)
      error.value = null
    } catch (err: any) {
      error.value = 'Failed to fetch Stats'
    } finally {
      isLoading.value = false
    }
  }

  onMounted(() => {
    fetchStats()
  })

  return {
    stats,
    isLoading,
    error,
    fetchStats
  }
}
