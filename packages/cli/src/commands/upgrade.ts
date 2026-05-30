import { defineCommand } from 'citty'
import { cliIntro, cliSuccess, isLatestVersion, installLatest } from '../utils'
import { toCliError } from '../services/api-error'
import { version } from '../../package.json'

export default defineCommand({
  meta: {
    name: 'upgrade',
    description: 'Upgrade the Shelve CLI to the latest version',
  },
  async run() {
    cliIntro('Upgrading Shelve CLI to the latest version')

    try {
      const isLatest = await isLatestVersion()
      if (isLatest) {
        cliSuccess({ previous: version, current: version, updated: false }, 'Shelve CLI is already up to date', 'upgrade')
        return
      }

      const latestVersion = await installLatest()
      cliSuccess({ previous: version, current: latestVersion, updated: true }, 'Shelve CLI has been successfully updated', 'upgrade')
    } catch (error) {
      throw toCliError(error, 'UPGRADE_FAILED')
    }
  },
})
