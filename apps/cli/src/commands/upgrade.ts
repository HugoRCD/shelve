import { defineCommand } from 'citty'
import consola from 'consola'
import { execa } from 'execa'
import { name, version } from '../../package.json'
import { isLatestVersion } from '../utils/update.ts'

export default defineCommand({
  meta: {
    name: 'upgrade',
    description: 'Upgrade the CLI to the latest version',
  },
  async setup() {
    const latestVersion = await isLatestVersion()
    if (!latestVersion) {
      consola.success('You are using the latest version of Shelve CLI')
    } else {
      consola.start(`Upgrading from ${version} to the latest version...`)
      try {
        await execa('npm', ['install', '-g', name], { stdio: 'inherit' })
        consola.success(`Successfully upgraded to version ${latestVersion}`)
      } catch (error) {
        consola.error('Failed to upgrade the CLI')
        consola.error(error)
        
      }
    }
  },
})
