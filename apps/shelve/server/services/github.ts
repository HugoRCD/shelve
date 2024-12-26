import type { H3Event } from 'h3'

type GitHubRepo = {
  name: string
  owner: { login: string }
}

export class GithubService {

  private readonly GITHUB_APP_NEW_URL = 'https://github.com/settings/apps/new'
  private readonly GITHUB_API = 'https://api.github.com'
  private readonly REPOS_PER_PAGE = 100
  private readonly DEFAULT_BRANCH = 'main'
  private readonly DEFAULT_COMMIT_MESSAGE = 'push from shelve'

  createGithubApp(event: H3Event): Promise<void> {
    const appUrl = getRequestHost(event)

    const manifest = {
      name: 'shelve',
      url: appUrl,
      hook_attributes: {
        url: `${appUrl}/api/github/webhook`,
        active: true
      },
      redirect_url: `${appUrl}/api/github/app-callback`,
      callback_urls: [`${appUrl}/api/github/oauth-callback`],
      setup_url: `${appUrl}/setup`,
      description: 'Shelve GitHub App',
      public: false,
      default_permissions: {
        issues: 'write',
        pull_requests: 'write',
        contents: 'write',
        metadata: 'read',
      },
      default_events: ['push'],
    }

    return sendRedirect(event, `${this.GITHUB_APP_NEW_URL}?manifest=${encodeURIComponent(JSON.stringify(manifest))}`)
  }

  /**
   * Get user's GitHub repositories
   */
  async getUserRepos(event: H3Event): Promise<GitHubRepo[]> {
    const { user, secure } = await getUserSession(event)

    const repos = await $fetch<GitHubRepo[]>(`${this.GITHUB_API}/user/repos?per_page=${this.REPOS_PER_PAGE}`, {
      headers: {
        Authorization: `token ${secure?.githubToken}`,
      },
    })

    console.log(`Found ${repos.length} repositories for user ${user!.username}`)
    console.log(repos.map((repo: GitHubRepo) => ({
      name: repo.name,
      owner: repo.owner.login,
    })))

    return repos
  }

  /**
   * Upload file to GitHub repository
   */
  async uploadFile(event: H3Event, file: File, repoName: string): Promise<any> {
    const { user, secure } = await getUserSession(event)

    const content = await this.getFileContent(file)
    const uploadUrl = this.buildUploadUrl(user!.username, repoName, file.name)

    return await $fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        Authorization: `token ${secure?.githubToken}`,
      },
      body: {
        message: this.DEFAULT_COMMIT_MESSAGE,
        content,
        branch: this.DEFAULT_BRANCH
      }
    })
  }

  /**
   * Convert file to base64
   */
  private async getFileContent(file: File): Promise<string> {
    const fileContent = await file.arrayBuffer()
    return Buffer.from(fileContent).toString('base64')
  }

  /**
   * Build GitHub API upload URL
   */
  private buildUploadUrl(username: string, repoName: string, fileName: string): string {
    return `${this.GITHUB_API}/repos/${username}/${repoName}/contents/${fileName}`
  }

}
