export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  return await new GithubService(event).getUserRepos(event, session.user.id, requireGithubToken(session))
})
