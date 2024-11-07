import { H3Event } from 'h3'

type GitHubRepo = {
  name: string
  owner: { login: string }
}

export class GitHubService {

  private readonly GITHUB_API = 'https://api.github.com'
  private readonly REPOS_PER_PAGE = 100
  private readonly DEFAULT_BRANCH = 'main'
  private readonly DEFAULT_COMMIT_MESSAGE = 'push from shelve'

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

    console.log(`Found ${repos.length} repositories for user ${user.username}`)
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
    const uploadUrl = this.buildUploadUrl(user.username, repoName, file.name)

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
