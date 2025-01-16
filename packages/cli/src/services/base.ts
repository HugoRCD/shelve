import { ofetch, type $Fetch, type FetchOptions } from 'ofetch'
import { spinner } from '@clack/prompts'
import { writeUser } from 'rc9'
import type { User } from '@shelve/types'
import { askPassword, loadShelveConfig } from '../utils'
import { ErrorService } from './error'

export abstract class BaseService {

  protected static api: $Fetch

  protected static async withLoading<T>(
    message: string,
    callback: () => Promise<T>
  ): Promise<T> {
    const s = spinner()
    try {
      s.start(message)
      const result = await callback()
      s.stop(message)
      return result
    } catch (error) {
      s.stop(`Failed: ${message.toLowerCase()}.`)
      throw error
    }
  }

  static whoAmI(url: string, token: string): Promise<User> {
    return this.withLoading('Fetching user data', () => {
      return ofetch(`${url}/api/user/me`, {
        method: 'GET',
        headers: {
          Cookie: `authToken=${token}`
        }
      })
    })
  }

  static async getToken(returnUser: boolean = false): Promise<string | { user: User, token: string }> {
    const { url } = await loadShelveConfig()
    const sanitizedUrl = url.replace(/\/+$/, '')
    const token = await askPassword(`Please provide a valid token (you can generate one on ${sanitizedUrl}/user/tokens)`)
    const user = await this.whoAmI(url, token)

    writeUser({ token, email: user.email, username: user.username }, '.shelve')

    if (returnUser) return {
      user,
      token
    }

    return token
  }

  protected static async getApi(): Promise<$Fetch> {
    if (!this.api) {
      const config = await loadShelveConfig()

      if (!config.token)
        config.token = <string> await this.getToken()

      const baseURL = `${config.url.replace(/\/+$/, '')}/api`

      this.api = ofetch.create({
        baseURL,
        headers: {
          Cookie: `authToken=${config.token}`
        },
        onResponseError: ErrorService.handleApiError
      })
    }
    return this.api
  }

  protected static async request<T>(endpoint: string, options?: FetchOptions<'json'>): Promise<T> {
    const api = await this.getApi()

    return api<T>(endpoint, options)
  }

}
