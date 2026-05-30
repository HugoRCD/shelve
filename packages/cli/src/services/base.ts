import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { ofetch, type $Fetch, type FetchOptions } from 'ofetch'
import { spinner } from '@clack/prompts'
import type { User } from '@types'
import { askPassword, loadShelveConfig } from '../utils'
import { formatCliError } from './api-error'
import { ErrorService } from './error'
import { CredentialsService } from './credentials'

type LoadingOptions = {
  recoverable?: (error: unknown) => boolean
}

export abstract class BaseService {

  protected static api: $Fetch

  protected static async withLoading<T>(
    message: string,
    callback: () => Promise<T>,
    options?: LoadingOptions,
  ): Promise<T> {
    const s = spinner()
    try {
      s.start(message)
      const result = await callback()
      s.stop(message)
      return result
    } catch (error) {
      if (options?.recoverable?.(error)) {
        s.stop(message)
        throw error
      }

      s.cancel(formatCliError(error, message))
      throw error
    }
  }

  static whoAmI(url: string, token: string): Promise<User> {
    return this.withLoading('Fetch user profile', () => {
      return ofetch(`${url}/api/user/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    })
  }

  static async getToken(returnUser: boolean = false): Promise<string | { user: User, token: string }> {
    const { url } = await loadShelveConfig()
    const sanitizedUrl = url.replace(/\/+$/, '')
    const token = await askPassword(`Please provide a valid token (you can generate one on ${sanitizedUrl}/user/tokens)`)
    const user = await this.whoAmI(url, token)

    await CredentialsService.writeToken(url, token, { email: user.email, username: user.username })

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
          Authorization: `Bearer ${config.token}`,
          'User-Agent': `shelve-cli/${getCliVersion()} (${process.platform}; node-${process.versions.node})`,
        },
        onResponseError: ErrorService.handleApiError,
      })
    }
    return this.api
  }

  protected static async request<T>(endpoint: string, options?: FetchOptions<'json'>): Promise<T> {
    const api = await this.getApi()

    return api<T>(endpoint, options)
  }

}

let _cliVersion = ''
function getCliVersion(): string {
  if (_cliVersion) return _cliVersion
  try {
    const here = dirname(fileURLToPath(import.meta.url))
    const pkgPath = join(here, '..', '..', 'package.json')
    const { version } = JSON.parse(readFileSync(pkgPath, 'utf-8'))
    _cliVersion = version || 'unknown'
  } catch {
    _cliVersion = 'unknown'
  }
  return _cliVersion
}
