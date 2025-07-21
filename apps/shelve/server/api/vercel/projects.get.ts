export default eventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const vercelService = new VercelService(event)
  
  return await vercelService.getProjects(user.id)
}) 
