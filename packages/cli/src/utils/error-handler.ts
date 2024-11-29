import { cancel } from '@clack/prompts'

export class ErrorHandler {

  static handleCancel(message: string): never {
    cancel(message)
    process.exit(1)
  }

  static handleError(error: Error): never {
    cancel(error.message)
    process.exit(1)
  }

}
