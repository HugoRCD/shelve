export default eventHandler(async (event) => {
  const team = useCurrentTeam(event)

  await new TeamsService().deleteTeam({ teamId: team.id })

  return {
    statusCode: 200,
    message: 'Team deleted',
  }
})
