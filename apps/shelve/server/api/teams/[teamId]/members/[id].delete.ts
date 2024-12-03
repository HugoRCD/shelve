import { MembersService } from '~~/server/services/members'
import { idParamsSchema } from '~~/server/database/zod'

export default eventHandler(async (event) => {
  const team = useTeam(event)

  const { id } = await getValidatedRouterParams(event, idParamsSchema.parse)

  await new MembersService().removeMember({
    teamId: team.id,
    memberId: id,
  })

  return {
    statusCode: 200,
    message: 'Member removed',
  }
})
