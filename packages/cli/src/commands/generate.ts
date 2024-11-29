import { intro, isCancel, outro, select } from '@clack/prompts'
import { Command } from 'commander'
import { onCancel } from '../utils'
import { getEslintConfig } from '../utils/templates'
import { EnvService } from '../services'

export function generateCommand(program: Command): void {
  program
    .command('generate')
    .alias('g')
    .description('Generate resources for a project')
    .action(async () => {
      intro('Generate resources for a project')

      const toGenerate = await select({
        message: 'Select the resources to generate:',
        options: [
          { value: 'example', label: '.env.example' },
          { value: 'eslint', label: 'ESLint config' },
        ]
      })

      if (isCancel(toGenerate)) onCancel('Operation cancelled.')

      switch (toGenerate) {
        case 'example':
          await EnvService.generateEnvExampleFile()
          break
        case 'eslint':
          await getEslintConfig()
          break
        default:
          onCancel('Invalid option')
      }

      outro('Done')
    })
}
