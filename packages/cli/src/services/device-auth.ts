import { exec } from 'node:child_process'
import { hostname, platform } from 'node:os'
import { promisify } from 'node:util'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ofetch } from 'ofetch'
import { note, spinner } from '@clack/prompts'
import { isNonInteractive } from '../utils/cli-context'
import { CliError } from './api-error'

const execAsync = promisify(exec)

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

async function openBrowser(url: string): Promise<boolean> {
  const cmd = process.platform === 'darwin'
    ? `open ${JSON.stringify(url)}`
    : process.platform === 'win32'
      ? `start "" ${JSON.stringify(url)}`
      : `xdg-open ${JSON.stringify(url)}`

  try {
    await execAsync(cmd)
    return true
  } catch {
    return false
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

  note(
    `If the browser does not open, visit:\n${start.verification_uri}\n\nCode: ${start.user_code}`,
    'Authorize Shelve CLI',
  )

  if (!options?.noBrowser) {
    const opened = await openBrowser(start.verification_uri)
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
