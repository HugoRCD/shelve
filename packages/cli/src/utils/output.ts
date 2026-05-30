import { cancel, intro, log, outro, spinner } from '@clack/prompts'
import type { ShelveConfig } from '@types'
import { CliError, formatCliError } from '../services/api-error'
import {
  getCommandFromArgv,
  isJson,
  isNonInteractive,
  isQuiet,
  shouldSkipConfirm,
} from './cli-context'

export type CliErrorInput = {
  code: string
  message: string
  status?: number
  hint?: string
}

export function redactConfig(config: ShelveConfig): Omit<ShelveConfig, 'token'> & { token?: string } {
  const { token, ...rest } = config
  return {
    ...rest,
    ...(token ? { token: '***' } : {}),
  }
}

export function writeJsonSuccess(data?: unknown, command?: string): void {
  const payload: Record<string, unknown> = { ok: true }
  if (command) payload.command = command
  if (data !== undefined) payload.data = data
  console.log(JSON.stringify(payload))
}

export function writeJsonError(error: CliErrorInput): void {
  console.error(JSON.stringify({
    ok: false,
    error: {
      code: error.code,
      message: error.message,
      ...(error.status !== undefined ? { status: error.status } : {}),
      ...(error.hint ? { hint: error.hint } : {}),
    },
  }))
}

export function cliError(input: CliErrorInput): never {
  const message = input.hint ? `${input.message} ${input.hint}` : input.message
  if (isJson()) {
    writeJsonError({ ...input, message })
  } else {
    console.error(message)
  }
  process.exit(1)
}

export function cliIntro(message: string): void {
  if (isJson() || isQuiet()) return
  intro(message)
}

export function cliOutro(message: string): void {
  if (isJson() || isQuiet()) return
  outro(message)
}

export function cliJsonEvent(event: string, data?: Record<string, unknown>): void {
  if (!isJson()) return
  console.error(JSON.stringify({ ok: true, event, ...data }))
}

export function cliSuccess(data?: unknown, message?: string, command?: string): void {
  if (isJson()) {
    writeJsonSuccess(data, command || getCommandFromArgv())
    return
  }
  if (message && !isQuiet()) outro(message)
}

export function cliInfo(message: string): void {
  if (isQuiet() || isJson()) return
  log.info(message)
}

export function cliSuccessLog(message: string): void {
  if (isQuiet() || isJson()) return
  log.success(message)
}

export function cliWarn(message: string): void {
  if (isQuiet()) return
  if (isJson()) {
    console.error(JSON.stringify({ ok: true, warning: message }))
    return
  }
  log.warn(message)
}

export function cliCancel(message: string): never {
  if (isJson()) {
    writeJsonError({ code: 'USER_CANCELLED', message })
  } else {
    cancel(message)
  }
  process.exit(1)
}

export function requireNonInteractive(message: string, hint?: string): void {
  if (isNonInteractive()) {
    throw new CliError(message, 'MISSING_INPUT', undefined, hint)
  }
}

export { shouldSkipConfirm }

export async function withSpinner<T>(
  message: string,
  callback: () => Promise<T>,
  options?: { recoverable?: (error: unknown) => boolean },
): Promise<T> {
  if (isQuiet() || isJson()) {
    try {
      return await callback()
    } catch (error) {
      if (options?.recoverable?.(error)) throw error
      handleThrownError(error, message)
    }
  }

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
    handleThrownError(error, message)
  }
}

function handleThrownError(error: unknown, context?: string): never {
  if (error instanceof CliError) {
    cliError({
      code: error.code,
      message: error.message,
      status: error.status,
      hint: error.hint,
    })
  }
  cliError({
    code: 'OPERATION_FAILED',
    message: formatCliError(error, context),
  })
}
