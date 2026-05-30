import { spinner, note } from '@clack/prompts'
import { addDependency } from 'nypm'
import semver from 'semver'
import npmFetch from 'npm-registry-fetch'
import { version } from '../../package.json'
import { isJson, isQuiet } from './cli-context'
import { cliCancel } from './output'

export * from './templates'
export * from './prompt'
export * from './config'
export * from './duration'
export * from './secret-refs'
export * from './ignore-files'
export * from './cli-context'
export * from './output'
export * from './error-codes'
export * from './sync-policy'

const s = spinner()

export function handleCancel(message: string): never {
  return cliCancel(message)
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

async function fetchLatestCliVersion(): Promise<string> {
  const packageInfo = await npmFetch.json('/@shelve/cli') as {
    'dist-tags': {
      latest: string
    }
  }
  return packageInfo['dist-tags'].latest
}

export async function isLatestVersion(): Promise<boolean> {
  const showSpinner = !isQuiet() && !isJson()
  if (showSpinner) s.start('Checking for updates')

  try {
    const latestVersion = await fetchLatestCliVersion()
    const isUpdated = semver.gte(version, latestVersion)

    if (!isUpdated && showSpinner)
      note(`Shelve CLI ${version} is available (latest version is ${latestVersion})`, 'Update available')

    return isUpdated
  } finally {
    if (showSpinner) s.stop('Checking for updates')
  }
}

export async function installLatest(): Promise<string> {
  const showSpinner = !isQuiet() && !isJson()
  const latestVersion = await fetchLatestCliVersion()
  if (showSpinner) s.start('Updating Shelve CLI')

  try {
    await addDependency('@shelve/cli@latest', {
      silent: true,
    })
    return latestVersion
  } finally {
    if (showSpinner) s.stop('Updating Shelve CLI')
  }
}
