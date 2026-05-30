import { confirm, isCancel, select, text, password } from '@clack/prompts'
import { CliError } from '../services/api-error'
import { isNonInteractive, shouldSkipConfirm } from './cli-context'
import { cliCancel } from './output'

export async function askBoolean(message: string): Promise<symbol | boolean> {
  if (shouldSkipConfirm()) return true

  if (isNonInteractive()) {
    throw new CliError(
      message,
      'CONFIRMATION_REQUIRED',
      undefined,
      'Pass --yes to skip confirmation prompts.',
    )
  }

  const response = await confirm({ message })
  if (isCancel(response) || response === false) cliCancel('Operation cancelled.')
  return true
}

export async function askSelect<T>(
  message: string,
  options: { value: T, label: string }[],
  hint = 'Pass the required flag or set the matching SHELVE_* environment variable.',
): Promise<T> {
  if (isNonInteractive()) {
    throw new CliError(message, 'MISSING_INPUT', undefined, hint)
  }

  const response = await select({
    message,
    // @ts-expect-error - TODO: fix this
    options,
  })
  if (isCancel(response)) cliCancel('Operation cancelled.')
  return response
}

export async function askText(
  message: string,
  placeholder?: string,
  initialValue?: string,
  hint = 'Pass the required flag or set the matching SHELVE_* environment variable.',
): Promise<string> {
  if (isNonInteractive()) {
    throw new CliError(message, 'MISSING_INPUT', undefined, hint)
  }

  const response = await text({
    message,
    placeholder,
    initialValue,
    validate(value) {
      if (!value?.length) return 'Value is required!'
    },
  })
  if (isCancel(response)) cliCancel('Operation cancelled.')
  return response
}

export async function askPassword(message: string, tokenFromFlag?: string): Promise<string> {
  const envToken = process.env.SHELVE_TOKEN
  if (tokenFromFlag) return tokenFromFlag
  if (envToken) return envToken

  if (isNonInteractive()) {
    throw new CliError(
      'Authentication token is required.',
      'AUTH_REQUIRED',
      undefined,
      'Set SHELVE_TOKEN or pass --token to shelve login.',
    )
  }

  const response = await password({
    message,
    validate(value) {
      if (!value?.length) return 'Value is required!'
    },
  })
  if (isCancel(response)) cliCancel('Operation cancelled.')
  return response
}
