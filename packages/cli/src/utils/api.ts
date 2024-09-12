import { ofetch } from 'ofetch'
import { cancel } from '@clack/prompts'
import { getConfig } from './config'

export async function useApi(): Promise<typeof ofetch> {
  const { config } = await getConfig()
  const { token, url } = config

  const sanitizedUrl = url.replace(/\/+$/, '') // remove trailing slash
  const baseURL = `${sanitizedUrl}/api`

  return ofetch.create({
    baseURL,
    onRequest({ options }) {
      options.headers = {
        ...options.headers,
        Cookie: `authToken=${token}`
      }
    },
    onResponseError(ctx) {
      if (ctx.response.status === 401) {
        cancel('Authentication failed, please verify your token')
        process.exit(0)
      }
      if (ctx.response.status === 500) {
        cancel('Internal server error, please try again later')
        process.exit(0)
      }
    }
  })
}
