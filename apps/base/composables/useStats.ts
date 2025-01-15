import type { UseStatsOptions, Stats } from '@shelve/types'


export function useStats(options: UseStatsOptions = {}) {
  const stats = ref<Stats>()
  const isLoading = ref(true)
  const error = ref<string | null>(null)
  let eventSource: EventSource | null = null

  const getEventSourceUrl = () => {
    // Si une baseUrl est fournie, l'utiliser
    if (options.baseUrl) {
      return `${options.baseUrl}/api/stats`
    }
    // Sinon, utiliser l'URL courante
    return `${location.origin}/api/stats`
  }

  const initStats = () => {
    if (import.meta.client) {
      isLoading.value = true
      error.value = null

      const url = getEventSourceUrl()
      eventSource = new EventSource(url)

      eventSource.onmessage = (event) => {
        stats.value = JSON.parse(event.data)
        isLoading.value = false
      }

      eventSource.onerror = (err) => {
        error.value = 'Failed to connect to stats stream'
        isLoading.value = false
        eventSource?.close()
      }
    }
  }

  const reconnect = () => {
    if (eventSource) {
      eventSource.close()
    }
    initStats()
  }

  initStats()

  onUnmounted(() => {
    if (eventSource) {
      eventSource.close()
      eventSource = null
    }
  })

  return {
    stats,
    isLoading,
    error,
    reconnect
  }
}
