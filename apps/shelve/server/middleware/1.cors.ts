export default defineEventHandler((event) => {
  const origin = getRequestHeader(event, 'origin')
  const runtimeConfig = useRuntimeConfig(event)

  if (origin) {
    const prodDomainPattern = /^https:\/\/(docs\.|www\.|app\.)?shelve\.cloud$/

    const devDomainPattern = /^http:\/\/(shelve\.)?localhost:\d+$/

    const customAllowedDomains = runtimeConfig.private.allowedOrigins
      ? runtimeConfig.private.allowedOrigins.split(',').map((d: string) => d.trim())
      : []

    // Vercel preview deployments (accepts any *.vercel.app domain)
    const vercelEnv = process.env.VERCEL_ENV
    const isVercelEnvironment = vercelEnv && ['preview', 'production'].includes(vercelEnv)
    const vercelPreviewPattern = /^https:\/\/.*\.vercel\.app$/

    const isAllowedOrigin =
      prodDomainPattern.test(origin) ||
      (process.env.NODE_ENV === 'development' && devDomainPattern.test(origin)) ||
      (isVercelEnvironment && vercelPreviewPattern.test(origin)) ||
      customAllowedDomains.includes(origin)

    if (!isAllowedOrigin) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Origin not allowed'
      })
    }

    setResponseHeaders(event, {
      'Access-Control-Allow-Origin': origin,
      'Vary': 'Origin'
    })
  }
})
