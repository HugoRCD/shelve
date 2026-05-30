import { defineCommand } from 'citty'
import { getEslintConfig, cliCancel, cliIntro, cliSuccess, handleCancel } from '../utils'
import { EnvService } from '../services'
import { CliError } from '../services/api-error'
import { isNonInteractive } from '../utils/cli-context'
import { loadShelveConfig } from '../utils/config'

const GENERATE_TYPES = {
  'env-example': 'example',
  eslint: 'eslint',
} as const

type GenerateType = keyof typeof GENERATE_TYPES

export default defineCommand({
  meta: {
    name: 'generate',
    description: 'Generate resources for a project',
  },
  args: {
    type: {
      type: 'string',
      description: 'Resource to generate: env-example | eslint',
      required: false,
    },
  },
  async run({ args }) {
    cliIntro('Generate resources for a project')

    const typeArg = args.type as GenerateType | undefined
    if (!typeArg) {
      if (isNonInteractive()) {
        throw new CliError(
          'Generate type is required.',
          'MISSING_INPUT',
          undefined,
          'Pass --type env-example or --type eslint.',
        )
      }
      const { select, isCancel } = await import('@clack/prompts')
      const toGenerate = await select({
        message: 'Select the resources to generate:',
        options: [
          { value: 'example', label: '.env.example' },
          { value: 'eslint', label: 'ESLint config' },
        ],
      })
      if (isCancel(toGenerate)) handleCancel('Operation cancelled.')
      await runGenerate(toGenerate as 'example' | 'eslint')
      return
    }

    const mapped = GENERATE_TYPES[typeArg]
    if (!mapped) {
      throw new CliError(
        `Unknown generate type "${typeArg}".`,
        'INVALID_INPUT',
        undefined,
        'Use --type env-example or --type eslint.',
      )
    }

    await runGenerate(mapped, typeArg)
  },
})

async function runGenerate(internal: 'example' | 'eslint', publicType?: string): Promise<void> {
  switch (internal) {
    case 'example': {
      await EnvService.generateEnvExampleFile()
      const { envFileName } = await loadShelveConfig()
      cliSuccess({ type: publicType || 'env-example', path: `${envFileName}.example` }, 'Done', 'generate')
      break
    }
    case 'eslint': {
      const path = await getEslintConfig()
      cliSuccess({ type: publicType || 'eslint', path }, 'Done', 'generate')
      break
    }
    default:
      cliCancel('Invalid option')
  }
}
