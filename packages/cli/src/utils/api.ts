import { ofetch } from 'ofetch'
import { getConfig } from './config'
import { onCancel } from './index'

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
      if (ctx.response.status === 401) onCancel('Authentication failed, please verify your token')
      if (ctx.response.status === 500) onCancel('Internal server error, please try again later')
    }
  })
}
