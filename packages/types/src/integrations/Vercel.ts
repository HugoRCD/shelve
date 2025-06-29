export type VercelIntegration = {
  id: number
  configurationId: string
  accessToken: string
  teamId: string | null
  userId: number
  createdAt: Date
  updatedAt: Date
}

export type VercelProject = {
  id: string
  name: string
  accountId: string
  createdAt: number
  updatedAt: number
  link?: {
    type: string
    repo: string
    repoId: number
    org?: string
  }
} 
