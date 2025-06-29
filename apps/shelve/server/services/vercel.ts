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

  async getProjects(userId: number): Promise<{ id: string; name: string; createdAt: number; framework?: string; link?: string }[]> {
    try {
      const integrations = await this.getIntegrations(userId)
      
      if (!integrations.length) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Vercel integration not found'
        })
      }

      const accessToken = await this.validateAndDecryptToken(integrations[0])
      const client = this.createClient(accessToken)
      
      const projectsResponse = await client.projects.getProjects({ limit: '100' })
      
      return projectsResponse.projects?.map(project => ({
        id: project.id!,
        name: project.name!,
        createdAt: project.createdAt!,
        framework: project.framework || undefined,
        link: project.link?.type === 'github' ? `https://github.com/${project.link.org}/${project.link.repo}` : undefined
      })) || []
    } catch (error: any) {
      this.handleError('fetch projects', error)
    }
  }

  async sendSecrets(
    userId: number,
    vercelProjectId: string,
    variables: { key: string; value: string }[],
    environmentIds?: number[]
  ) {
    try {
      const integrations = await this.getIntegrations(userId)

      if (!integrations.length) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Vercel integration not found'
        })
      }

      const accessToken = await this.validateAndDecryptToken(integrations[0])
      const client = this.createClient(accessToken)

      const vercelTargets = environmentIds ? await this.mapShelveToVercelEnvironments(environmentIds) : ['production', 'preview', 'development'] as const

      const results = await Promise.allSettled(
        variables.map(async ({ key: secretKey, value: secretValue }) => {
          try {
            await client.projects.createProjectEnv({
              idOrName: vercelProjectId,
              upsert: 'true',
              requestBody: {
                key: secretKey,
                value: secretValue,
                target: vercelTargets as any,
                type: 'encrypted'
              }
            })
            return { key: secretKey, status: 'success' }
          } catch (error: any) {
            return { key: secretKey, status: 'error', error: error.message }
          }
        })
      )

      const successful = results.filter(r => r.status === 'fulfilled' && r.value.status === 'success')
      const failed = results.filter(r => r.status === 'fulfilled' && r.value.status === 'error')

      if (failed.length === variables.length) {
        throw createError({
          statusCode: 500,
          statusMessage: `All variables failed to sync: ${failed.map(f => (f as any).value.key).join(', ')}`
        })
      }

      return {
        statusCode: 201,
        message: `Successfully synced ${successful.length}/${variables.length} variables to Vercel`,
        results: {
          successful: successful.length,
          failed: failed.length,
          details: failed.length > 0 ? failed.map(f => (f as any).value) : undefined
        }
      }
    } catch (error: any) {
      this.handleError('send secrets', error)
    }
  }

  private async mapShelveToVercelEnvironments(environmentIds: number[]): Promise<('production' | 'preview' | 'development')[]> {
    try {
      const environments = await useDrizzle().query.environments.findMany({
        where: inArray(tables.environments.id, environmentIds)
      })

      const vercelTargets: ('production' | 'preview' | 'development')[] = []
      
      for (const env of environments) {
        const envName = env.name.toLowerCase()
        
        switch (envName) {
          case 'development':
            vercelTargets.push('development')
            break
          case 'preview':
          case 'staging':
            vercelTargets.push('preview')
            break
          case 'production':
          case 'prod':
            vercelTargets.push('production')
            break
          default:
            vercelTargets.push('preview')
            break
        }
      }

      return [...new Set(vercelTargets)]
    } catch (error) {
      console.error('Error mapping environments:', error)
      return ['production', 'preview', 'development']
    }
  }

} 
