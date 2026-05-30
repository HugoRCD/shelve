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
  if (!isQuiet() && !isJson()) s.start('Checking for updates')

  const latestVersion = await fetchLatestCliVersion()

  if (!isQuiet() && !isJson()) s.stop('Checking for updates')
  const isUpdated = semver.gte(version, latestVersion)

  if (!isUpdated && !isQuiet() && !isJson())
    note(`Shelve CLI ${version} is available (latest version is ${latestVersion})`, 'Update available')

  return isUpdated
}

export async function installLatest(): Promise<string> {
  const latestVersion = await fetchLatestCliVersion()
  if (!isQuiet() && !isJson()) s.start('Updating Shelve CLI')
  await addDependency('@shelve/cli@latest', {
    silent: true,
  })
  if (!isQuiet() && !isJson()) s.stop('Updating Shelve CLI')
  return latestVersion
}
