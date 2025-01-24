import type { Stats, UseStatsOptions } from '~~/packages/types'

export function useStats(options: UseStatsOptions = {}) {
  const stats = useState<Stats>('stats')
  const isLoading = ref(true)
  const error = ref<string | null>(null)
  const wsRef = ref<WebSocket | null>(null)
  const isConnected = ref(false)
  const isMounted = ref(true)

  async function initialFetch() {
    const baseUrl = options.baseUrl || location.host
    try {
      stats.value = await $fetch(`${ baseUrl }/api/stats`)
    } catch (error: any) {
      console.error('Failed to fetch Stats:', error)
      error.value = 'Failed to fetch Stats'
    } finally {
      isLoading.value = false
    }
  }

  const cleanup = () => {
    if (wsRef.value) {
      wsRef.value.close()
      wsRef.value = null
    }
    isConnected.value = false
    isLoading.value = false
  }

  const getWebSocketUrl = () => {
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
    let baseUrl = options.baseUrl || location.host
    baseUrl = baseUrl.replace(/^(http|https):\/\//, '')
    return `${protocol}//${baseUrl}/api/stats/ws`
  }

  const initWebSocket = () => {
    if (!isMounted.value) return

    cleanup()

    try {
      const ws = new WebSocket(getWebSocketUrl())
      wsRef.value = ws

      ws.onopen = () => {
        if (!isMounted.value) {
          ws.close()
          return
        }
        console.log('Stats WebSocket connected')
        isConnected.value = true
        isLoading.value = false
        error.value = null
      }

      ws.onmessage = (event) => {
        if (!isMounted.value) return
        try {
          stats.value = JSON.parse(event.data)
        } catch (err) {
          console.error('Failed to parse Stats WebSocket data:', err)
        }
      }

      ws.onclose = (event) => {
        console.log('Stats WebSocket closed:', event.code, event.reason)
        isConnected.value = false
        wsRef.value = null

        if (isMounted.value && event.code !== 1000) {
          error.value = 'Connection lost'
        }
      }

      ws.onerror = (event) => {
        if (!isMounted.value) return
        console.error('Stats WebSocket error:', event)
        error.value = 'Connection error'
      }
    } catch (err) {
      if (!isMounted.value) return
      console.error('Failed to initialize Stats WebSocket:', err)
      error.value = 'Failed to initialize connection'
      isLoading.value = false
    }
  }

  const reconnect = () => {
    if (!isMounted.value) return
    error.value = null
    isLoading.value = true
    initWebSocket()
  }

  onMounted(() => {
    if (import.meta.client) {
      isMounted.value = true
      initWebSocket()
    }
  })

  onBeforeUnmount(() => {
    isMounted.value = false
    cleanup()
  })

  return {
    stats,
    isLoading,
    error,
    isConnected,
    reconnect,
    initialFetch
  }
}
