import { intro, isCancel, outro, select } from '@clack/prompts'
import { Command } from 'commander'
import { generateEnvExampleFile } from '../utils/env'
import { onCancel } from '../utils'

export function generateCommand(program: Command): void {
  program
    .command('generate')
    .description('Generate resources for a project')
    .action(async () => {
      intro('Generate resources for a project')

      const toGenerate = await select({
        message: 'Select the resources to generate:',
        options: [{ value: 'example', label: '.env.example' },],
      })

      if (isCancel(toGenerate)) onCancel('Operation cancelled.')

      switch (toGenerate) {
        case 'example':
          await generateEnvExampleFile()
          break
        default:
          onCancel('Invalid option')
      }

      outro('Done')
    })
}
