export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  console.log('Vercel callback', query)
  const { code, configurationId, teamId: vercelTeamId, next, source } = query

  if (!code || !configurationId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required parameters: code and configurationId'
    })
  }

  try {
    const { user } = await requireUserSession(event)
    const vercelService = new VercelService(event)

    const requestURL = getRequestURL(event)
    const redirectUri = `${requestURL.protocol}//${requestURL.host}/api/vercel/integrations/callback`

    // Exchange code for access token
    const tokenResponse = await vercelService.exchangeCodeForToken(code as string, redirectUri)

    console.log('Vercel access token', tokenResponse.access_token)

    await vercelService.storeIntegration(
      configurationId as string,
      tokenResponse.access_token,
      user.id
    )

    // Redirect to success page or decode the next URL
    const redirectUrl = next 
      ? decodeURIComponent(next as string)
      : '/user/integrations?integration=vercel&setup=success'

    await sendRedirect(event, redirectUrl)
  } catch (error: any) {
    console.error('Vercel callback error:', error)
    
    // Redirect to error page
    await sendRedirect(event, '/user/integrations?integration=vercel&setup=error')
  }
}) 
