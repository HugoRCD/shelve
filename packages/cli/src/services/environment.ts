import type { Environment } from '@shelve/types'
import { isCancel, select, spinner } from '@clack/prompts'
import { ofetch } from 'ofetch'
import { capitalize, handleCancel } from '../utils'
import { ApiService } from './api'

const s = spinner()

export class EnvironmentService {

  private static getApi(): Promise<typeof ofetch> {
    return ApiService.initialize()
  }

  static async getTeamEnvironment(teamId?: number): Promise<Environment[]> {
    const api = await this.getApi()

    s.start('Fetching environments')
    try {
      const environments = await api(`/environments${ teamId ? `?teamId=${ teamId }` : '' }`)
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

