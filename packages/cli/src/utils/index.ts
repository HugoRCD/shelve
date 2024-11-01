import { cancel, spinner, note } from '@clack/prompts'
import { addDependency } from 'nypm'
import semver from 'semver'
import npmFetch from 'npm-registry-fetch'
import { version } from '../../package.json'

const s = spinner()

export function onCancel(message: string, output: number = 0): never {
  cancel(message)
  process.exit(output)
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
