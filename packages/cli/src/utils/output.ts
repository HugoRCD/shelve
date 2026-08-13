import { cancel, intro, log, outro, spinner } from '@clack/prompts'
import type { ShelveConfig } from '@types'
import { CliError, ShelveApiError, formatCliError, toCliError } from '../services/api-error'
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
  context?: Record<string, unknown>
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
      ...(error.context ? { context: error.context } : {}),
    },
  }))
}

export function cliError(input: CliErrorInput): never {
  if (isJson()) {
    writeJsonError(input)
  } else {
    const message = input.hint ? `${input.message} ${input.hint}` : input.message
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
    s.cancel()
    handleThrownError(error, message)
  }
}

/**
 * Converts a thrown error to a CliError and throws it, instead of exiting the
 * process directly. withSpinner runs inside runInWorkspaces' fan-out loop, and a
 * hard exit here used to leave that loop's own catch — which attributes the
 * failure to a package and lists what already completed — unreachable. Throwing
 * lets it run; the top-level `reportErrors` wrapper (index.ts) still turns
 * whatever comes out of a command's `run` into the same --json envelope this used
 * to write directly, so a command outside a fan-out sees no difference.
 *
 * A CliError or ShelveApiError goes to toCliError as-is: wrapping it in a bare
 * Error first (as this used to) discarded a ShelveApiError's status and threw
 * away the specific code toCliError derives from it (FORBIDDEN, NOT_FOUND,
 * AUTH_REQUIRED), landing on OPERATION_FAILED with no HTTP status instead. Any
 * other error still gets formatCliError's contextual wording and falls back to
 * OPERATION_FAILED, same as before.
 */
function handleThrownError(error: unknown, context?: string): never {
  if (error instanceof CliError || error instanceof ShelveApiError) throw toCliError(error)
  throw toCliError(new Error(formatCliError(error, context)))
}
