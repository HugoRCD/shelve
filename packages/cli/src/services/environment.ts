import type { Environment } from '@shelve/types'
import { isCancel } from '@clack/prompts'
import { askSelect, capitalize, handleCancel } from '../utils'
import { BaseService } from './base'
import { API_ENDPOINTS } from '../constants'

export class EnvironmentService extends BaseService {

  static async getTeamEnvironment(teamId?: number): Promise<Environment[]> {
    return this.withLoading('Fetching environments', async () => {
      return await this.request<Environment[]>(`${API_ENDPOINTS.environments}${teamId ? `?teamId=${teamId}` : ''}`)
    })
  }

  static async promptEnvironment(teamId?: number): Promise<Environment> {
    const environments = await this.getTeamEnvironment(teamId)

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

