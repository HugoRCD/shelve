export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  
  const vercelService = new VercelService(event)

  return vercelService.getIntegrations(user.id)
}) 
