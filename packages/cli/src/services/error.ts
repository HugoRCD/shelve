import { cancel } from '@clack/prompts'
import { DEBUG } from '../constants'

export class ErrorService {

  static handle(error: any, message: string): void {
    if (DEBUG) {
      console.error(error)
    }
    cancel(message)
  }

  static handleApiError = (ctx: any): void => {
    const errorMap: Record<number, string> = {
      401: 'Authentication failed, please verify your token',
      500: 'Internal server error, please try again later',
    }

    const message = errorMap[ctx.response.status] || ctx.response.statusText
    ErrorService.handle(ctx, message)
  }

}
