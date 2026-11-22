import { execFile } from 'node:child_process'
import { hostname, platform } from 'node:os'
import { promisify } from 'node:util'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ofetch } from 'ofetch'
import { note, spinner } from '@clack/prompts'
import { isNonInteractive } from '../utils/cli-context'
import { CliError } from './api-error'

const execFileAsync = promisify(execFile)

type DeviceStartResponse = {
  device_code: string
  user_code: string
  verification_uri: string
  expires_in: number
  interval: number
}

type DevicePollResponse =
  | { status: 'pending' }
  | { status: 'approved', access_token: string }

function getCliVersion(): string {
  try {
    const here = dirname(fileURLToPath(import.meta.url))
    const pkgPath = join(here, '..', '..', 'package.json')
    const { version } = JSON.parse(readFileSync(pkgPath, 'utf-8'))
    return version || 'unknown'
  } catch {
    return 'unknown'
  }
}

/**
 * Opens `url` without a shell: the url comes from the server, so it must never be
 * parsed as a command line (`$(...)` under sh, `&` under cmd.exe).
 */
async function openBrowser(url: URL): Promise<boolean> {
  const [command, args]: [string, string[]] = process.platform === 'darwin'
    ? ['open', [url.href]]
    : process.platform === 'win32'
      ? ['rundll32', ['url.dll,FileProtocolHandler', url.href]]
      : ['xdg-open', [url.href]]

  try {
    await execFileAsync(command, args)
    return true
  } catch {
    return false
  }
}

/**
 * The verification url the server sent, if it is an http(s) page on the server
 * being logged in to. Anything else is only shown, never opened.
 */
function parseVerificationUri(uri: string, base: string): URL | null {
  try {
    const url = new URL(uri)
    const sameOrigin = url.origin === new URL(base).origin
    return sameOrigin && (url.protocol === 'https:' || url.protocol === 'http:') ? url : null
  } catch {
    return null
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function getFetchErrorDetails(error: unknown): { status?: number, statusMessage?: string } {
  if (!error || typeof error !== 'object') return {}
  const e = error as {
    status?: number
    statusCode?: number
    data?: { statusMessage?: string }
    statusMessage?: string
  }
  return {
    status: e.status ?? e.statusCode,
    statusMessage: e.data?.statusMessage ?? e.statusMessage,
  }
}

function mapDevicePollError(error: unknown): CliError {
  if (error instanceof CliError) return error

  const { status, statusMessage } = getFetchErrorDetails(error)

  if (status === 403 || statusMessage?.toLowerCase().includes('denied')) {
    return new CliError(
      'CLI authorization was denied in the browser.',
      'DEVICE_LOGIN_DENIED',
      status,
      'Run `shelve login` again and choose Authorize.',
    )
  }

  if (status === 400 && statusMessage?.toLowerCase().includes('expired')) {
    return new CliError(
      'CLI authorization expired before completion.',
      'DEVICE_LOGIN_EXPIRED',
      status,
      'Run `shelve login` again.',
    )
  }

  if (status === 429) {
    return new CliError(
      statusMessage || 'Too many polling attempts.',
      'DEVICE_LOGIN_TIMEOUT',
      status,
      'Wait a moment and run `shelve login` again.',
    )
  }

  return new CliError(
    statusMessage || 'Device login failed.',
    'DEVICE_LOGIN_TIMEOUT',
    status,
    'Check your network and Shelve URL, then run `shelve login` again.',
  )
}

export async function loginWithDeviceFlow(
  url: string,
  options?: { noBrowser?: boolean },
): Promise<string> {
  if (isNonInteractive()) {
    throw new CliError(
      'Device login requires an interactive terminal.',
      'AUTH_REQUIRED',
      undefined,
      'Set SHELVE_TOKEN or pass --token to shelve login.',
    )
  }

  const base = url.replace(/\/+$/, '')
  const cliVersion = getCliVersion()

  const start = await ofetch<DeviceStartResponse>(`${base}/api/auth/device`, {
    method: 'POST',
    body: {
      hostname: hostname(),
      platform: platform(),
      cliVersion,
    },
    headers: {
      'User-Agent': `shelve-cli/${cliVersion} (${platform()}; node-${process.versions.node})`,
    },
  })

  const verificationUrl = parseVerificationUri(start.verification_uri, base)

  note(
    `If the browser does not open, visit:\n${start.verification_uri}\n\nCode: ${start.user_code}`,
    'Authorize Shelve CLI',
  )

  if (!verificationUrl) {
    note(
      `The server sent an authorization link that is not on ${base}, so it was not opened.`,
      'Check this link before you open it',
    )
  } else if (!options?.noBrowser) {
    const opened = await openBrowser(verificationUrl)
    if (!opened) {
      note(start.verification_uri, 'Open this URL')
    }
  }

  const pollSpinner = spinner()
  pollSpinner.start('Waiting for browser authorization…')

  const deadline = Date.now() + start.expires_in * 1000
  const intervalMs = start.interval * 1000

  while (Date.now() < deadline) {
    await sleep(intervalMs)

    try {
      const result = await ofetch<DevicePollResponse>(`${base}/api/auth/device/token`, {
        method: 'POST',
        body: { device_code: start.device_code },
        headers: {
          'User-Agent': `shelve-cli/${cliVersion} (${platform()}; node-${process.versions.node})`,
        },
      })

      if (result.status === 'approved' && result.access_token) {
        pollSpinner.stop('Authorized')
        return result.access_token
      }
    } catch (error) {
      pollSpinner.stop('Authorization failed')
      throw mapDevicePollError(error)
    }
  }

  pollSpinner.stop('Timed out')
  throw new CliError(
    'CLI authorization timed out.',
    'DEVICE_LOGIN_TIMEOUT',
    undefined,
    'Run `shelve login` again and complete approval in the browser.',
  )
}
