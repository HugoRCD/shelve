export type GitHubRepo = {
  name: string
  owner: { login: string }
}

export type GithubApp = {
  id: number
  installationId: string
  isOrganization: boolean
  userId: number
  createdAt: string
  updatedAt: string
}
