export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const configurationId = getRouterParam(event, 'configurationId')

  if (!configurationId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Configuration ID is required'
    })
  }

  const vercelService = new VercelService(event)
  const result = await vercelService.deleteIntegration(configurationId, user.id)

  return {
    message: 'Vercel integration removed successfully',
    ...result
  }
}) 
