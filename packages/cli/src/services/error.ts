import { cancel } from '@clack/prompts'
import { DEBUG } from '../constants'

export class ErrorService {

  static handleApiError = (ctx: any): void => {
    const errorMap: Record<number, string> = {
      401: 'Authentication failed, please verify your token',
      500: 'Internal server error, please try again later',
    }

    const message = errorMap[ctx.response.status] || ctx.response.statusText

    if (DEBUG) console.error(ctx)

    cancel(message)
  }

}
