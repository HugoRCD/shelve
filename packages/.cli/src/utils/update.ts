import { cyan, green, yellow, underline } from 'colorette'
import * as semver from 'semver'
import { $fetch } from 'ofetch'
import consola from 'consola'
import shelvePkg from '../../package.json'
import { capitalize } from './string'

export async function checkForUpdates(): Promise<void> {
  const { version: latestVersion = '' } = await $fetch(
    `https://registry.npmjs.org/${shelvePkg.name}/latest`
  )
  if (!latestVersion) {
    return
  }
  if (semver.gt(latestVersion, shelvePkg.version, { loose: true })) {
    const changelogURL = `https://github.com/HugoRCD/shelve/releases/tag/v${latestVersion}`
    consola.box({
      title: `Shelve CLI Update Available 🚀`,
      style: {
        borderColor: 'green',
      },
      message: [
        `A new version of ${capitalize(shelvePkg.name)} is available: ${green(latestVersion)}`,
        `You are currently using ${yellow(shelvePkg.version)}`,
        '',
        `Release notes: ${underline(cyan(changelogURL))}`,
        '',
        `To update: \`npm install -g ${shelvePkg.name}\``,
      ].join('\n'),
    })
  }
}

export async function isLatestVersion(): Promise<boolean | undefined> {
  const { version: latestVersion = '' } = await $fetch(
    `https://registry.npmjs.org/${shelvePkg.name}/latest`
  )
  if (!latestVersion) {
    return
  }
  return semver.gt(latestVersion, shelvePkg.version, { loose: true })
}
