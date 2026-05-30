export class ShelveApiError extends Error {

  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ShelveApiError'
    this.status = status
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
  if (error instanceof ShelveApiError) return error.message
  if (error instanceof Error && error.message) return error.message
  if (context) return `${context} failed`
  return 'Something went wrong'
}

export function isRecoverableHttpError(error: unknown, statuses: number[]): boolean {
  const status = getHttpStatus(error)
  return status !== undefined && statuses.includes(status)
}
