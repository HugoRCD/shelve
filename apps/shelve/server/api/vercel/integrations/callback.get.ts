import { z } from 'zod'

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, z.object({
    code: z.string(),
    configurationId: z.string(),
    teamId: z.string().optional(),
    next: z.string().optional()
  }).parse)

  const { code, configurationId, teamId, next } = query

  if (!code || !configurationId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required parameters: code and configurationId'
    })
  }

  try {
    const session = await getUserSession(event)
    
    if (!session.user) {
      const requestURL = getRequestURL(event)
      const callbackUrl = `${requestURL.href}`
      const loginUrl = `/login?redirect=${encodeURIComponent(callbackUrl)}`
      
      await sendRedirect(event, loginUrl)
      return
    }

    const { user } = session
    const vercelService = new VercelService(event)

    const requestURL = getRequestURL(event)
    const redirectUri = `${requestURL.protocol}//${requestURL.host}/api/vercel/integrations/callback`

    await vercelService.handleOAuthCallback(
      code, 
      configurationId, 
      redirectUri, 
      user.id,
      teamId || null
    )

    const redirectUrl = next 
      ? decodeURIComponent(next)
      : '/user/integrations?integration=vercel&setup=success'

    await sendRedirect(event, redirectUrl)
  } catch (error: any) {
    console.error('Vercel callback error:', error)
      
    await sendRedirect(event, '/user/integrations?integration=vercel&setup=error')
  }
}) 
