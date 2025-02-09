import { idParamsSchema } from '~~/server/database/zod'

export default eventHandler(async (event) => {
  const team = useCurrentTeam(event)

  const { id } = await getValidatedRouterParams(event, idParamsSchema.parse)

  await new MembersService().removeMember({
    teamId: team.id,
    slug: team.slug,
    memberId: id,
  })

  return {
    statusCode: 200,
    message: 'Member removed',
  }
})
