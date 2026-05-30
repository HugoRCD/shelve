export class ShelveApiError extends Error {

  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ShelveApiError'
    this.status = status
  }

}

export class CliError extends Error {

  readonly code: string
  readonly status?: number
  readonly hint?: string

  constructor(message: string, code: string, status?: number, hint?: string) {
    super(message)
    this.name = 'CliError'
    this.code = code
    this.status = status
    this.hint = hint
  }

}

export function getHttpStatus(error: unknown): number | undefined {
  if (error instanceof ShelveApiError) return error.status
  if (error && typeof error === 'object') {
    const e = error as { status?: number, statusCode?: number, response?: { status?: number } }
    return e.status ?? e.statusCode ?? e.response?.status
  }
  return undefined
}

export function formatCliError(error: unknown, context?: string): string {
  if (error instanceof CliError) return error.message
  if (error instanceof ShelveApiError) return error.message
  if (error instanceof Error && error.message) return error.message
  if (context) return `${context} failed`
  return 'Something went wrong'
}

export function toCliError(error: unknown, fallbackCode = 'OPERATION_FAILED'): CliError {
  if (error instanceof CliError) return error
  if (error instanceof ShelveApiError) {
    const code = error.status === 401 ? 'AUTH_REQUIRED'
      : error.status === 403 ? 'FORBIDDEN'
      : error.status === 404 ? 'NOT_FOUND'
      : 'API_ERROR'
    return new CliError(error.message, code, error.status)
  }
  if (error instanceof Error && error.message) {
    return new CliError(error.message, fallbackCode)
  }
  return new CliError('Something went wrong', fallbackCode)
}

export function isRecoverableHttpError(error: unknown, statuses: number[]): boolean {
  const status = getHttpStatus(error)
  return status !== undefined && statuses.includes(status)
}
