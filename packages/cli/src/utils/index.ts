import { spinner, note } from '@clack/prompts'
import { addDependency } from 'nypm'
import semver from 'semver'
import npmFetch from 'npm-registry-fetch'
import { version } from '../../package.json'

export * from './spinner'
export * from './templates'
export * from './prompt'
export * from './config'

const s = spinner()

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export async function isLatestVersion(): Promise<boolean> {
  s.start('Checking for updates')

  const packageInfo = await npmFetch.json('/@shelve/cli') as {
    'dist-tags': {
      latest: string
    }
  }

  s.stop('Checking for updates')

  const latestVersion = packageInfo['dist-tags'].latest
  const isUpdated = semver.gte(version, latestVersion)

  if (!isUpdated)
    note(`Shelve CLI ${version} is available (latest version is ${latestVersion})`, 'Update available')

  return isUpdated
}

export async function installLatest(): Promise<void> {
  s.start('Updating Shelve CLI')
  await addDependency('@shelve/cli@latest', {
    silent: true,
  })
  s.stop('Updating Shelve CLI')
}
