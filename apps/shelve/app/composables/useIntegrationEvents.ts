import { useEventBus } from '@vueuse/core'

type IntegrationEventData = {
  type: 'github' | 'vercel' | 'openai'
  action: 'connected' | 'disconnected'
}

const integrationBus = useEventBus<IntegrationEventData>('integration-events')

export function useIntegrationEvents() {
  return {
    emit: integrationBus.emit,
    on: integrationBus.on,
    off: integrationBus.off
  }
} 
