import { intro, isCancel, outro, select } from '@clack/prompts'
import { Command } from 'commander'
import { getEslintConfig } from '../utils'
import { EnvService } from '../services'
import { ErrorHandler } from '../utils/error-handler'

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

      if (isCancel(toGenerate)) ErrorHandler.handleCancel('Operation cancelled.')

      switch (toGenerate) {
        case 'example':
          await EnvService.generateEnvExampleFile()
          break
        case 'eslint':
          await getEslintConfig()
          break
        default:
          ErrorHandler.handleCancel('Invalid option')
      }

      outro('Done')
    })
}
