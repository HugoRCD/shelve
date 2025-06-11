export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  return new GithubService(event).getUserRepos(event, user.id) || []
})
