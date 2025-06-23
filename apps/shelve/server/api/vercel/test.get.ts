export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  
  const vercelService = new VercelService(event)
  const testResult = await vercelService.testConnection(user.id)

  return testResult
}) 
