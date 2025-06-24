export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const integration = getRouterParam(event, 'integration')
  const id = getRouterParam(event, 'id')

  if (!integration || !id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Integration type and ID are required'
    })
  }

  let result
  switch (integration.toLowerCase()) {
    case 'github':
      result = await new GithubService(event).deleteIntegration(id, user.id)
      break
    case 'vercel':
      result = await new VercelService(event).deleteIntegration(id, user.id)
      break
    default:
      throw createError({
        statusCode: 400,
        statusMessage: `Unsupported integration type: ${integration}`
      })
  }

  return {
    message: `${integration} integration removed successfully`,
    ...result
  }
}) 
