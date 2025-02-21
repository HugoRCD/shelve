import { intro, outro } from '@clack/prompts'
import { defineCommand } from 'citty'
import { isLatestVersion, installLatest, handleCancel } from '../utils'

export default defineCommand({
  meta: {
    name: 'upgrade',
    description: 'Upgrade the Shelve CLI to the latest version'
  },
  async run() {
    intro('Upgrading Shelve CLI to the latest version')

    try {
      const isLatest = await isLatestVersion()
      if (isLatest) {
        outro('Shelve CLI is already up to date')
        return
      }

      await installLatest()
      outro('Shelve CLI has been successfully updated')
    } catch (error) {
      handleCancel('Operation cancelled.')
    }
  }
})
