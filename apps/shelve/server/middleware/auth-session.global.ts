import { getRequestPath } from 'h3'

const EXCLUDED_PREFIXES = ['/api/auth', '/_nuxt', '/favicon.ico', '/sw.js']

export default defineEventHandler(async (event) => {
  const path = getRequestPath(event)

  if (EXCLUDED_PREFIXES.some((prefix) => path.startsWith(prefix))) {
    return
  }

  await getShelveSession(event)
})
