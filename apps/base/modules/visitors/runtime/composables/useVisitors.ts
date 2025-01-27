export function useVisitors() {
  const visitors = useState<number>('visitors')
  const isLoading = ref(true)
  const error = ref<string | null>(null)
  const wsRef = ref<WebSocket | null>(null)
  const isConnected = ref(false)
  const isMounted = ref(true)

  const getWebSocketUrl = () => {
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
    const baseUrl = location.host.replace(/^(http|https):\/\//, '')
    return `${protocol}//${baseUrl}/api/_visitors_/ws`
  }

  const cleanup = () => {
    if (wsRef.value) {
      wsRef.value.close()
      wsRef.value = null
    }
    isConnected.value = false
    isLoading.value = false
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
          visitors.value = +event.data
        } catch (err) {
          console.error('Failed to parse visitors WebSocket data:', err)
        }
      }

      ws.onclose = (event) => {
        console.log('Visitors WebSocket closed:', event.code, event.reason)
        isConnected.value = false
        wsRef.value = null

        if (isMounted.value && event.code !== 1000) {
          error.value = 'Connection lost'
        }
      }

      ws.onerror = (event) => {
        if (!isMounted.value) return
        console.error('Visitors WebSocket error:', event)
        error.value = 'Connection error'
      }
    } catch (err) {
      if (!isMounted.value) return
      console.error('Failed to initialize Visitors WebSocket:', err)
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
    visitors,
    isLoading,
    error,
    isConnected,
    reconnect
  }
}
