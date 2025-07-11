import type { BaseIntegration } from '@types'

interface Integration extends BaseIntegration {
  installationId?: number // For GitHub
  configurationId?: string // For Vercel
}

interface IntegrationConnection {
  connected: boolean
  message: string
  user?: any
  data?: any
}

export function useIntegrations() {
  async function getIntegrations<T extends Integration>(type: string): Promise<T[]> {
    try {
      return await $fetch<T[]>(`/api/integrations/${type}`)
    } catch (error) {
      console.error(`Error fetching ${type} integrations:`, error)
      return []
    }
  }

  async function testConnection(type: string): Promise<IntegrationConnection> {
    try {
      return await $fetch<IntegrationConnection>(`/api/integrations/${type}/test`)
    } catch (error: any) {
      console.error(`Error testing ${type} connection:`, error)
      return {
        connected: false,
        message: error.message || 'Connection test failed'
      }
    }
  }

  async function deleteIntegration(type: string, integration: Integration): Promise<{ success: boolean; message: string }> {
    try {
      let identifier: string | number
      
      switch (type.toLowerCase()) {
        case 'github':
          identifier = integration.installationId!
          break
        case 'vercel':
          identifier = integration.configurationId!
          break
        default:
          identifier = integration.id
      }

      return await $fetch(`/api/integrations/${type}/${identifier}`, {
        method: 'DELETE'
      })
    } catch (error: any) {
      console.error(`Error deleting ${type} integration:`, error)
      throw error
    }
  }

  function getConnectionModalUrl(type: string): string {
    const config = useRuntimeConfig()
    switch (type.toLowerCase()) {
      case 'github':
        const githubAppName = config.public.github.appName
        return `https://github.com/apps/${githubAppName}/installations/new`
      
      case 'vercel':
        const vercelAppName = config.public.vercel.appName
        const redirectUri = `${window.location.origin}/api/vercel/integrations/callback`
        return `https://vercel.com/integrations/${vercelAppName}/new?redirect_uri=${encodeURIComponent(redirectUri)}`
      
      default:
        throw new Error(`Unsupported integration type: ${type}`)
    }
  }

  function getManagementUrl(type: string, integration?: Integration): string {
    switch (type.toLowerCase()) {
      case 'github':
        return integration?.installationId 
          ? `https://github.com/settings/installations/${integration.installationId}` 
          : 'https://github.com/settings/installations'
      
      case 'vercel':
        return 'https://vercel.com/dashboard/integrations'
      
      default:
        return '#'
    }
  }

  return {
    getIntegrations,
    testConnection,
    deleteIntegration,
    getConnectionModalUrl,
    getManagementUrl
  }
} 
