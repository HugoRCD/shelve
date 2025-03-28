export default defineEventHandler((event) => {
  const origin = getRequestHeader(event, 'origin')
  const runtimeConfig = useRuntimeConfig(event)

  if (origin) {
    const prodDomainPattern = /^https:\/\/(docs\.|www\.|app\.)?shelve\.cloud$/

    const devDomainPattern = /^http:\/\/(shelve\.)?localhost:\d+$/

    const customAllowedDomains = runtimeConfig.private.allowedOrigins
      ? runtimeConfig.private.allowedOrigins.split(',').map((d: string) => d.trim())
      : []

    const isAllowedOrigin =
      prodDomainPattern.test(origin) ||
      (import.meta.env.NODE_ENV === 'development' && devDomainPattern.test(origin)) ||
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
