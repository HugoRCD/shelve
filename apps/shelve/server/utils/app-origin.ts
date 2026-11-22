import type { H3Event } from 'h3'

/**
 * The origin to put in links that leave the app, such as the links in emails and the CLI login URL.
 * It comes from `NUXT_PUBLIC_APP_URL`. Without it, the request's own origin is only used on Vercel,
 * which routes requests by their host, and in development. Elsewhere the Host header is set by the
 * client, so no link is built.
 */
export function getAppOrigin(event: H3Event): string {
  const { appUrl } = useRuntimeConfig(event).public
  if (appUrl) return new URL(appUrl).origin
  if (process.env.VERCEL || import.meta.dev) return getRequestURL(event).origin

  const message = 'NUXT_PUBLIC_APP_URL is not set. Set it to the URL Shelve is served from, for example https://shelve.example.com.'
  console.error(`[shelve] ${message}`)
  throw createError({ statusCode: 500, statusMessage: message })
}
