import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { ofetch, type $Fetch, type FetchOptions } from 'ofetch'
import type { User } from '@types'
import { debugLog, isDebug } from '../constants'
import { askPassword, loadShelveConfig } from '../utils'
import { withSpinner } from '../utils/output'
import { toCliError } from './api-error'
import { ErrorService } from './error'
import { CredentialsService } from './credentials'
import { loginWithDeviceFlow } from './device-auth'

type LoadingOptions = {
  recoverable?: (error: unknown) => boolean
}

export abstract class BaseService {

  protected static api: $Fetch

  protected static withLoading<T>(
    message: string,
    callback: () => Promise<T>,
    options?: LoadingOptions,
  ): Promise<T> {
    return withSpinner(message, callback, options)
  }

  static whoAmI(url: string, token: string): Promise<User> {
    return this.withLoading('Fetch user profile', () => {
      return ofetch(`${url}/api/user/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        onRequest({ request, options: reqOptions }) {
          logHttpRequest(reqOptions.method || 'GET', request.toString())
        },
        onResponse({ request, response, options: reqOptions }) {
          logHttpResponse(reqOptions.method || 'GET', request.toString(), response.status)
        },
      })
    })
  }

  static async getToken(
    returnUser: boolean = false,
    tokenFromFlag?: string,
    options?: { withToken?: boolean, noBrowser?: boolean },
  ): Promise<string | { user: User, token: string }> {
    const { url } = await loadShelveConfig()
    const sanitizedUrl = url.replace(/\/+$/, '')

    let token: string
    if (tokenFromFlag || process.env.SHELVE_TOKEN || options?.withToken) {
      token = await askPassword(
        `Please provide a valid token (you can generate one on ${sanitizedUrl}/user/tokens)`,
        tokenFromFlag,
      )
    } else {
      token = await loginWithDeviceFlow(url, { noBrowser: options?.noBrowser })
    }

    const user = await this.whoAmI(url, token)

    await CredentialsService.writeToken(url, token, { email: user.email, username: user.username })

    if (returnUser) return {
      user,
      token,
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
        onRequest({ request, options: reqOptions }) {
          logHttpRequest(reqOptions.method || 'GET', request.toString())
        },
        onResponse({ request, response, options: reqOptions }) {
          logHttpResponse(reqOptions.method || 'GET', request.toString(), response.status)
        },
        onResponseError: ErrorService.handleApiError,
      })
    }
    return this.api
  }

  protected static async request<T>(endpoint: string, options?: FetchOptions<'json'>): Promise<T> {
    const api = await this.getApi()

    try {
      return await api<T>(endpoint, options)
    } catch (error) {
      throw toCliError(error)
    }
  }

}

function logHttpRequest(method: string, url: string): void {
  if (!isDebug()) return
  debugLog(`HTTP ${method} ${sanitizeUrl(url)}`)
}

function logHttpResponse(method: string, url: string, status: number): void {
  if (!isDebug()) return
  debugLog(`HTTP ${method} ${sanitizeUrl(url)} → ${status}`)
}

function sanitizeUrl(url: string): string {
  return url.replace(/Bearer\s+[^\s]+/gi, 'Bearer ***')
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
