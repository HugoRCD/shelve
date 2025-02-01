import { TeamRole } from '@types'

export default eventHandler(async (event) => {
  const protectedRoutes = ['/api/teams/']

  if (!protectedRoutes.some((route) => event.path?.startsWith(route))) return

  const requestUrl = getRequestURL(event)
  const { method } = event

  const [,,, teamSlug] = requestUrl.pathname.split('/')

  if (!teamSlug) throw createError({ statusCode: 400, statusMessage: 'Invalid teamSlug' })

  const { user } = await requireUserSession(event)

  const team = await validateTeamAccess({ user, teamSlug })
  event.context.team = team

  const currentMember = team.members.find((member) => member.userId === user.id)
  if (!currentMember) throw createError({ statusCode: 401, statusMessage: 'Unauthorized: User does not belong to the team' })

  if (method === 'PUT') {
    validateTeamRole(currentMember, TeamRole.ADMIN)
  } else if (method === 'DELETE') {
    validateTeamRole(currentMember, TeamRole.OWNER)
  }
  event.context.currentMember = currentMember
})
