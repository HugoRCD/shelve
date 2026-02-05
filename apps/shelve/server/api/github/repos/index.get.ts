export default defineEventHandler(async (event) => {
  const { user } = await requireAppSession(event)
  return new GithubService(event).getUserRepos(event, user.id) || []
})
