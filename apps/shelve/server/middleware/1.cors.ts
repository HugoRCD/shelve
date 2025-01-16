export default defineEventHandler((event) => {
  const origin = getRequestHeader(event, 'origin')

  if (origin) {
    const prodDomainPattern = /^https:\/\/(docs\.|www\.)?shelve\.cloud$/

    const devDomainPattern = /^http:\/\/(shelve\.)?localhost:\d+$/

    const isAllowedOrigin =
      prodDomainPattern.test(origin) ||
      (import.meta.env.NODE_ENV === 'development' && devDomainPattern.test(origin))

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
