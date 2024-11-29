import { $Fetch, ofetch } from 'ofetch'
import { cancel, isCancel, password } from '@clack/prompts'
import { handleCancel, loadShelveConfig } from '../utils'
import { EnvService } from './env'

export class ApiService {

  private static instance: $Fetch

  static async getToken(): Promise<string> {
    const { url } = await loadShelveConfig()
    const sanitizedUrl = url.replace(/\/+$/, '')
    const token = await password({
      message: `Please provide a valid token (you can generate one on ${sanitizedUrl}/tokens)`,
      validate: (value) => value.length === 0 ? 'Value is required!' : undefined
    })

    if (isCancel(token))
      handleCancel('Operation cancelled.')

    await EnvService.mergeEnvFile([{ key: 'SHELVE_TOKEN', value: token }])
    return token
  }

  static async initialize(): Promise<$Fetch> {
    if (this.instance) return this.instance

    const config = await loadShelveConfig()
    let { token } = config

    if (!token)
      token = await this.getToken()

    const sanitizedUrl = config.url.replace(/\/+$/, '')
    const baseURL = `${ sanitizedUrl }/api`

    this.instance = ofetch.create({
      baseURL,
      headers: {
        Cookie: `authToken=${ config.token }`
      },
      onResponseError: this.handleResponseError
    })

    return this.instance
  }

  private static handleResponseError(ctx: any): void {
    const debug = process.env.DEBUG === 'true'
    if (debug) console.log(ctx.response)

    switch (ctx.response.status) {
      case 401:
        cancel('Authentication failed, please verify your token')
        break
      case 500:
        cancel('Internal server error, please try again later')
        break
      default:
        cancel(ctx.response.statusText)
        break
    }
  }

}
