import type { Environment } from '@shelve/types'
import { isCancel } from '@clack/prompts'
import { askSelect, capitalize, handleCancel } from '../utils'
import { API_ENDPOINTS } from '../constants'
import { BaseService } from './base'

export class EnvironmentService extends BaseService {

  static getTeamEnvironment(): Promise<Environment[]> {
    return this.withLoading('Fetching environments', async () => {
      return await this.request<Environment[]>(`${API_ENDPOINTS.environments}`)
    })
  }

  static async promptEnvironment(): Promise<Environment> {
    const environments = await this.getTeamEnvironment()

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

