import type { Environment } from '@shelve/types'
import { isCancel, select, spinner } from '@clack/prompts'
import { capitalize, handleCancel } from '../utils'
import { BaseService } from './base'
import { API_ENDPOINTS } from '../constants'

const s = spinner()

export class EnvironmentService extends BaseService {

  static async getTeamEnvironment(teamId?: number): Promise<Environment[]> {
    s.start('Fetching environments')
    try {
      const environments = await this.request<Environment[]>(`${API_ENDPOINTS.environments}${teamId ? `?teamId=${teamId}` : ''}`)
      s.stop('Fetching environments')
      return environments
    } catch (e) {
      handleCancel('Failed to fetch environments')
    }
  }

  static async promptEnvironment(teamId?: number): Promise<Environment> {
    const environments = await this.getTeamEnvironment(teamId)

    const environmentId = await select({
      message: 'Select the environment:',
      options: environments.map(env => ({
        value: env.id,
        label: capitalize(env.name)
      })),
    })

    if (isCancel(environmentId)) handleCancel('Operation cancelled.')

    const environment = environments.find(env => env.id === environmentId)
    if (!environment) handleCancel('Invalid environment')

    return environment
  }

}

