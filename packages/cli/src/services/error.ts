import { debugLog, isDebug } from '../constants'
import { ShelveApiError } from './api-error'

const ERROR_MESSAGES: Record<number, string> = {
  401: 'Authentication failed — run `shelve login` or check your token',
  403: 'Access denied — your token cannot access this resource',
  404: 'Not found — check your team slug and project name in shelve.json',
  500: 'Shelve server error — try again later',
}

export class ErrorService {

  static handleApiError = (ctx: { response: Response }): void => {
    const status = ctx.response.status
    const message = ERROR_MESSAGES[status]
      ?? (ctx.response.statusText || `Request failed (${status})`)

    if (isDebug()) {
      debugLog('API error', { status, url: ctx.response.url })
    }

    throw new ShelveApiError(message, status)
  }

}
