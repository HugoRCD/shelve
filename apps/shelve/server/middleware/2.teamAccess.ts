export default eventHandler(async (event) => {
  const protectedRoutes = ['/api/teams/']

  if (!protectedRoutes.some((route) => event.path?.startsWith(route))) return

  const requestUrl = getRequestURL(event)
  const teamId = +requestUrl.pathname.split('/')[3]

  const { user } = await requireUserSession(event)

  const team = await validateTeamAccess({ user, teamId })
  event.context.team = team
  event.context.currentMember = team.members.find((member) => member.userId === user.id)
})
