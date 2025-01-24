export type GitHubRepo = {
  name: string
  owner: { login: string }
}

export type GitHubAppOwner = {
  login: string
  id: number
  node_id: string
  avatar_url: string
  gravatar_id: string
  url: string
  html_url: string
  followers_url: string
  following_url: string
  gists_url: string
  starred_url: string
  subscriptions_url: string
  organizations_url: string
  repos_url: string
  events_url: string
  received_events_url: string
  type: string
  user_view_type: string
  site_admin: boolean
}

export type GitHubAppPermissions = {
  issues: 'write' | 'read'
  pull_requests: 'write' | 'read'
  contents: 'write' | 'read'
  metadata: 'write' | 'read'
}

export type GitHubAppResponse = {
  id: number
  client_id: string
  slug: string
  node_id: string
  owner: GitHubAppOwner
  name: string
  description: string
  external_url: string
  html_url: string
  created_at: string
  updated_at: string
  webhook_secret: string
  pem: string
  client_secret: string
  permissions: GitHubAppPermissions
  events: string[]
}

export type GithubApp = {
  id: number
  slug: string
  appId: number
  privateKey: string
  webhookSecret: string
  clientId: string
  clientSecret: string
  userId: number
  createdAt: Date
  updatedAt: Date
}
