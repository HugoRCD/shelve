import { Command } from 'commander'
import { intro, outro } from '@clack/prompts'
import { isLatestVersion, installLatest, handleCancel } from '../utils'

export function upgradeCommand(program: Command): void {
  program
    .command('upgrade')
    .alias('u')
    .description('Upgrade the Shelve CLI to the latest version')
    .action(async () => {
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
    })
}
