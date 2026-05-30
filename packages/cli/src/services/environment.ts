import { isCancel } from '@clack/prompts'
import type { Environment } from '@types'
import { askSelect, capitalize, handleCancel, isNonInteractive } from '../utils'
import { CliError } from './api-error'
import { BaseService } from './base'

export class EnvironmentService extends BaseService {

  static async promptEnvironment(slug: string): Promise<Environment> {
    const environments = await this.withLoading('Fetch environments', async () => {
      return await this.request<Environment[]>(`/teams/${slug}/environments`)
    })

    const environmentId = await askSelect('Select the environment:', environments.map(env => ({
      value: env.id,
      label: capitalize(env.name)
    })))

    if (isCancel(environmentId)) handleCancel('Operation cancelled.')

    const environment = environments.find(env => env.id === environmentId)
    if (!environment) handleCancel('Invalid environment')

    return environment
  }

  static async getEnvironment(slug: string, name?: string): Promise<Environment> {
    if (name) {
      return await this.withLoading(`Fetch environment ${name}`, async () => {
        return await this.request<Environment>(`/teams/${ slug }/environments/${ name }`)
      })
    }
    if (isNonInteractive()) {
      throw new CliError(
        'Environment name is required.',
        'MISSING_ENV',
        undefined,
        'Pass --env or set defaultEnv in shelve.json / SHELVE_DEFAULT_ENV.',
      )
    }
    return await this.promptEnvironment(slug)
  }

}
