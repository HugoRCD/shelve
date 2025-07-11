export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const integration = getRouterParam(event, 'integration')

  if (!integration) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Integration type is required'
    })
  }

  switch (integration.toLowerCase()) {
    case 'github':
      return await new GithubService(event).getIntegrations(user.id)
    case 'vercel':
      return await new VercelService(event).getIntegrations(user.id)
    default:
      throw createError({
        statusCode: 400,
        statusMessage: `Unsupported integration type: ${integration}`
      })
  }
}) 
