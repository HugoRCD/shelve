import { intro, isCancel, outro, select } from '@clack/prompts'
import { defineCommand } from 'citty'
import { getEslintConfig, handleCancel } from '../utils'
import { EnvService } from '../services'

export default defineCommand({
  meta: {
    name: 'generate',
    description: 'Generate resources for a project',
  },
  async run() {
    intro('Generate resources for a project')

    const toGenerate = await select({
      message: 'Select the resources to generate:',
      options: [
        { value: 'example', label: '.env.example' },
        { value: 'eslint', label: 'ESLint config' },
      ]
    })

    if (isCancel(toGenerate)) handleCancel('Operation cancelled.')

    switch (toGenerate) {
      case 'example':
        await EnvService.generateEnvExampleFile()
        break
      case 'eslint':
        await getEslintConfig()
        break
      default:
        handleCancel('Invalid option')
    }

    outro('Done')
  },
})
