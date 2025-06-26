import type { H3Event } from 'h3'
import { Vercel } from '@vercel/sdk'
import type { VercelIntegration, IntegrationConfig, OAuthTokenResponse } from '@types'
import { BaseIntegrationService } from './base-integration'

export class VercelService extends BaseIntegrationService<VercelIntegration> {

  private readonly VERCEL_API = 'https://api.vercel.com'

  constructor(event: H3Event) {
    super(event, 'Vercel')
  }

  protected getOAuthConfig(): IntegrationConfig {
    const { clientId, clientSecret } = this.config.oauth.vercel

    if (!clientId || !clientSecret) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Vercel OAuth credentials are missing'
      })
    }

    return { clientId, clientSecret }
  }

  protected createClient(accessToken: string) {
    return new Vercel({
      bearerToken: accessToken,
    })
  }

  protected async exchangeCodeForToken(code: string, redirectUri: string): Promise<OAuthTokenResponse> {
    const { clientId, clientSecret } = this.getOAuthConfig()

    try {
      const requestBody = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      })

      const response = await $fetch<OAuthTokenResponse>(`${this.VERCEL_API}/v2/oauth/access_token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: requestBody.toString(),
      })

      return response
    } catch (error: any) {
      this.handleError('exchange code for token', error)
    }
  }

  protected async validateAndDecryptToken(integration: VercelIntegration): Promise<string> {
    return await this.decryptToken(integration.accessToken)
  }

  protected async performConnectionTest(client: Vercel): Promise<{ user: any; data: any }> {
    const { user } = await client.user.getAuthUser()
    
    const projectsResponse = await client.projects.getProjects({ limit: '100' })
    const projectCount = projectsResponse.projects?.length || 0
    
    return { 
      user,
      data: { 
        username: user.username || user.email,
        projectCount 
      }
    }
  }

  async getIntegrations(userId: number): Promise<VercelIntegration[]> {
    try {
      return await useDrizzle().query.vercelIntegration.findMany({
        where: eq(tables.vercelIntegration.userId, userId),
        orderBy: (integrations, { desc }) => [desc(integrations.createdAt)]
      })
    } catch (error: any) {
      this.handleError('fetch', error)
    }
  }

  async deleteIntegration(configurationId: string, userId: number): Promise<{ success: boolean }> {
    try {
      const integration = await useDrizzle().query.vercelIntegration.findFirst({
        where: and(
          eq(tables.vercelIntegration.configurationId, configurationId),
          eq(tables.vercelIntegration.userId, userId)
        )
      })

      if (!integration) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Vercel integration not found'
        })
      }

      await useDrizzle()
        .delete(tables.vercelIntegration)
        .where(eq(tables.vercelIntegration.id, integration.id))

      return { success: true }
    } catch (error: any) {
      this.handleError('delete', error)
    }
  }

  async storeIntegration(data: {
    configurationId: string
    accessToken: string
    userId: number
    teamId?: string | null
  }): Promise<VercelIntegration> {
    try {
      const encryptedToken = await this.encryptToken(data.accessToken)

      const [integration] = await useDrizzle()
        .insert(tables.vercelIntegration)
        .values({
          configurationId: data.configurationId,
          accessToken: encryptedToken,
          teamId: data.teamId,
          userId: data.userId,
        })
        .returning()

      return integration
    } catch (error: any) {
      this.handleError('store', error)
    }
  }

  // eslint-disable-next-line
  async handleOAuthCallback(
    code: string,
    configurationId: string,
    redirectUri: string,
    userId: number,
    teamId?: string | null
  ): Promise<VercelIntegration> {
    const tokenResponse = await this.exchangeCodeForToken(code, redirectUri)
    
    return await this.storeIntegration({
      configurationId,
      accessToken: tokenResponse.access_token,
      userId,
      teamId
    })
  }

} 
