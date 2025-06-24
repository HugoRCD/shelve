export interface IntegrationConnection {
  connected: boolean
  message: string
  user?: any
  data?: any
}

export interface IntegrationConfig {
  clientId: string
  clientSecret: string
}

export interface OAuthTokenResponse {
  access_token: string
  token_type: string
  [key: string]: any
}

export interface BaseIntegration {
  id: number
  userId: number
  createdAt: Date
  updatedAt: Date
} 
