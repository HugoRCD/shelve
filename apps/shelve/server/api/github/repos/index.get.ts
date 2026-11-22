export default defineEventHandler(async (event) => {
  const { user } = await requireAuth(event)
  return await new GithubService(event).getUserRepos(event, user.id, requireGithubToken(await getGithubToken(event)))
})
