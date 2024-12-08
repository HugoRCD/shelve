import { TeamRole } from '@shelve/types'

export default eventHandler(async (event) => {
  const protectedRoutes = ['/api/teams/']

  if (!protectedRoutes.some((route) => event.path?.startsWith(route))) return

  const requestUrl = getRequestURL(event)
  const { method } = event

  const teamId = +requestUrl.pathname.split('/')[3]

  if (!teamId) throw createError({ statusCode: 400, message: 'Invalid teamId' })

  const { user } = await requireUserSession(event)

  const team = await validateTeamAccess({ user, teamId })
  event.context.team = team

  const currentMember = team.members.find((member) => member.userId === user.id)
  if (!currentMember) throw createError({ statusCode: 401, message: 'Unauthorized: User does not belong to the team' })

  if (method === 'PUT') {
    validateTeamRole(currentMember, TeamRole.ADMIN)
  } else if (method === 'DELETE') {
    validateTeamRole(currentMember, TeamRole.OWNER)
  }
  event.context.currentMember = currentMember
})
