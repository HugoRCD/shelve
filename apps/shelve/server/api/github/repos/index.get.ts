export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const repos = await new GithubService(event).getUserRepos(event, user.id)

  return {
    data: repos || []
  }
})
