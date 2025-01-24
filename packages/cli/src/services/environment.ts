import { isCancel } from '@clack/prompts'
import { askSelect, capitalize, handleCancel } from '../utils'
import { BaseService } from './base'
import type { Environment } from '~~/types'

export class EnvironmentService extends BaseService {

  static async promptEnvironment(slug: string): Promise<Environment> {
    const environments = await this.withLoading('Fetching environments', async () => {
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

}

