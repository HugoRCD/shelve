export type GitHubRepo = {
  id: number
  name: string
  full_name: string
  private: boolean
  html_url: string
  description: string
  fork: boolean
  url: string
  created_at: string
  updated_at: string
  pushed_at: string
  git_url: string
  ssh_url: string
  clone_url: string
  default_branch: string
  homepage: string
  owner: {
    login: string
    id: number
    avatar_url: string
    html_url: string
  }
}

export type GithubApp = {
  id: number
  installationId: string
  isOrganisation: boolean
  userId: number
  createdAt: string
  updatedAt: string
}
