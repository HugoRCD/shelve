import type { H3Event } from 'h3'
import type { 
  IntegrationConnection,
  IntegrationConfig,
  OAuthTokenResponse,
  BaseIntegration
} from '@types'

export interface StoredIntegration {
  id: number
  userId: number
  createdAt: Date
  updatedAt: Date
}

export abstract class BaseIntegrationService<T extends StoredIntegration = StoredIntegration> {

  protected readonly config: ReturnType<typeof useRuntimeConfig>
  protected readonly integrationName: string

  constructor(event: H3Event, integrationName: string) {
    this.config = useRuntimeConfig(event)
    this.integrationName = integrationName
  }

  protected abstract getOAuthConfig(): IntegrationConfig

  protected abstract createClient(accessToken: string): any

  protected abstract exchangeCodeForToken(
    code: string, 
    redirectUri: string
  ): Promise<OAuthTokenResponse>

  protected abstract validateAndDecryptToken(
    integration: T
  ): Promise<string>

  protected abstract performConnectionTest(
    client: any
  ): Promise<{ user?: any; data?: any }>

  abstract getIntegrations(userId: number): Promise<T[]>

  abstract deleteIntegration(uniqueId: string, userId: number): Promise<{ success: boolean }>

  abstract storeIntegration(data: Record<string, any>): Promise<T>

  async testConnection(userId: number): Promise<IntegrationConnection> {
    try {
      const integrations = await this.getIntegrations(userId)
      
      if (!integrations.length) {
        return { 
          connected: false, 
          message: `No ${this.integrationName} integration found` 
        }
      }

      const [integration] = integrations
      const accessToken = await this.validateAndDecryptToken(integration)
      const client = this.createClient(accessToken)
      const testResult = await this.performConnectionTest(client)

      let message = `${this.integrationName} connection successful`
      
      if (testResult.data) {
        if (this.integrationName === 'Vercel' && testResult.data.projectCount !== undefined) {
          const { projectCount } = testResult.data
          const username = testResult.data.username ? ` as ${testResult.data.username}` : ''
          message = `Connected to Vercel${username} with access to ${projectCount} ${projectCount === 1 ? 'project' : 'projects'}`
        }
      }

      return {
        connected: true,
        message,
        ...testResult
      }
    } catch (error: any) {
      console.error(`Error testing ${this.integrationName} connection:`, error)
      return { 
        connected: false, 
        message: `${this.integrationName} connection failed: ${error.message}` 
      }
    }
  }

  protected async encryptToken(accessToken: string): Promise<string> {
    const { encryptionKey } = this.config.private
    return await seal(accessToken, encryptionKey)
  }

  protected async decryptToken(encryptedToken: string): Promise<string> {
    const { encryptionKey } = this.config.private
    return await unseal(encryptedToken, encryptionKey) as string
  }

  protected handleError(operation: string, error: any): never {
    console.error(`Error ${operation} ${this.integrationName} integration:`, error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || `Failed to ${operation} ${this.integrationName} integration: ${error.message}`
    })
  }

} 
