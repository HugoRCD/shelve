import { cyan, green, yellow, underline } from 'colorette'
import * as semver from 'semver'
import { $fetch } from 'ofetch'
import consola from 'consola'
import { name, version, repository } from '../../package.json'
import { capitalize } from './string'

export async function checkForUpdates(): Promise<void> {
  const { version: latestVersion = '' } = await $fetch(
    `https://registry.npmjs.org/${name}/latest`
  )
  if (!latestVersion) {
    return
  }
  if (semver.gt(latestVersion, version, { loose: true })) {
    const changelogURL = `${repository}/releases/tag/v${latestVersion}`
    consola.box({
      title: `Shelve CLI Update Available 🚀`,
      style: {
        borderColor: 'green',
      },
      message: [
        `A new version of ${capitalize(name)} is available: ${green(latestVersion)}`,
        `You are currently using ${yellow(version)}`,
        '',
        `Release notes: ${underline(cyan(changelogURL))}`,
        '',
        `To update: \`npm install -g ${name}\` or \`shelve upgrade\``,
      ].join('\n'),
    })
  }
}

export async function isLatestVersion(): Promise<boolean | undefined> {
  const { version: latestVersion = '' } = await $fetch(
    `https://registry.npmjs.org/${name}/latest`
  )
  if (!latestVersion) {
    return
  }
  return semver.gt(latestVersion, version, { loose: true })
}
