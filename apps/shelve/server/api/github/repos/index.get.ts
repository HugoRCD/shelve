export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  return await new GithubService(event).getUserRepos(event, user.id) || []
})
