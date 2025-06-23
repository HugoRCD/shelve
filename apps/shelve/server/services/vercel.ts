import type { H3Event } from 'h3'
import { Vercel } from '@vercel/sdk'

export class VercelService {

  private readonly VERCEL_API = 'https://api.vercel.com'
  private readonly config: ReturnType<typeof useRuntimeConfig>

  constructor(event: H3Event) {
    this.config = useRuntimeConfig(event)
  }

  private createVercelClient(accessToken: string) {
    return new Vercel({
      bearerToken: accessToken,
    })
  }

  async exchangeCodeForToken(code: string, redirectUri: string): Promise<{
    access_token: string
    token_type: string
    installation_id?: string
    user_id?: string
    team_id?: string
  }> {
    const { clientId, clientSecret } = this.config.oauth.vercel

    console.log('Vercel OAuth config:', {
      clientId: clientId ? `${clientId.substring(0, 4)}...` : 'MISSING',
      clientSecret: clientSecret ? `${clientSecret.substring(0, 4)}...` : 'MISSING',
      code: code ? `${code.substring(0, 8)}...` : 'MISSING'
    })

    if (!clientId || !clientSecret) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Vercel OAuth credentials are missing'
      })
    }

    try {
      const requestBody = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      })

      console.log('Vercel token exchange request:', {
        url: `${this.VERCEL_API}/v2/oauth/access_token`,
        redirect_uri: redirectUri,
        bodyParams: requestBody.toString()
      })

      const response = await $fetch<{
        access_token: string
        token_type: string
        installation_id?: string
        user_id?: string
        team_id?: string
      }>(`${this.VERCEL_API}/v2/oauth/access_token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: requestBody.toString(),
      })

      console.log('Vercel token exchange success:', response)

      return response
    } catch (error: any) {
      console.error('Vercel token exchange error details:', {
        status: error.status,
        statusText: error.statusText,
        data: error.data,
        message: error.message
      })
      throw createError({
        statusCode: error.status || 500,
        statusMessage: `Failed to exchange code for token: ${error.message}`
      })
    }
  }

  async storeIntegration(
    configurationId: string,
    accessToken: string,
    userId: number
  ) {
    const { encryptionKey } = this.config.private

    try {
      const encryptedToken = await seal(accessToken, encryptionKey)

      const [integration] = await useDrizzle()
        .insert(tables.vercelIntegration)
        .values({
          configurationId,
          accessToken: encryptedToken,
          userId,
        })
        .returning()

      return integration
    } catch (error: any) {
      console.error('Error storing Vercel integration:', error)
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to store Vercel integration: ${error.message}`
      })
    }
  }

  async getIntegrations(userId: number) {
    try {
      const integrations = await useDrizzle().query.vercelIntegration.findMany({
        where: eq(tables.vercelIntegration.userId, userId),
        orderBy: (integrations, { desc }) => [desc(integrations.createdAt)]
      })

      return integrations
    } catch (error: any) {
      console.error('Error fetching Vercel integrations:', error)
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to fetch Vercel integrations: ${error.message}`
      })
    }
  }

  async deleteIntegration(configurationId: string, userId: number) {
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
      console.error('Error deleting Vercel integration:', error)
      throw createError({
        statusCode: error.statusCode || 500,
        statusMessage: error.statusMessage || `Failed to delete Vercel integration: ${error.message}`
      })
    }
  }

  async testConnection(userId: number) {
    try {
      const integration = await useDrizzle().query.vercelIntegration.findFirst({
        where: eq(tables.vercelIntegration.userId, userId)
      })

      if (!integration) {
        return { connected: false, message: 'No Vercel integration found' }
      }

      const { encryptionKey } = this.config.private
      const accessToken = await unseal(integration.accessToken, encryptionKey)
      console.log('Vercel access token', accessToken)

      const vercel = this.createVercelClient(accessToken as string)

      const user = await vercel.user.getAuthUser()

      return {
        connected: true,
        message: 'Vercel connection successful',
        user: user
      }
    } catch (error: any) {
      console.error('Error testing Vercel connection:', error)
      return { 
        connected: false, 
        message: `Connection failed: ${error.message}` 
      }
    }
  }

} 
