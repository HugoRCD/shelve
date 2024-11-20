import { ofetch } from 'ofetch'
import { isCancel, password } from '@clack/prompts'
import { loadShelveConfig } from './config'
import { mergeEnvFile } from './env'
import { onCancel } from './index'

export async function getToken(): Promise<string> {
  const token = await password({
    message: 'Please provide a valid token (you can generate one on https://app.shelve.cloud/tokens)',
    validate(value) {
      if (value.length === 0) return `Value is required!`
    },
  })

  if (isCancel(token)) onCancel('Operation cancelled.')

  await mergeEnvFile([{ key: 'SHELVE_TOKEN', value: token }])

  return token
}

export async function useApi(debug: boolean = true): Promise<typeof ofetch> {
  const config = await loadShelveConfig(false)
  const { url } = config
  let { token } = config

  if (!token) token = await getToken()

  const sanitizedUrl = url.replace(/\/+$/, '') // remove trailing slash
  const baseURL = `${sanitizedUrl}/api`

  return ofetch.create({
    baseURL,
    headers: {
      Cookie: `authToken=${token}`
    },
    onResponseError(ctx) {
      if (debug) console.log(ctx.response)
      if (ctx.response.status === 401) onCancel('Authentication failed, please verify your token')
      if (ctx.response.status === 500) onCancel('Internal server error, please try again later')
    }
  })
}
