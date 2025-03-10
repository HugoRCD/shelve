import { isCancel } from '@clack/prompts'
import type { Environment } from '@types'
import { askSelect, capitalize, handleCancel } from '../utils'
import { BaseService } from './base'

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

  static async getEnvironment(slug: string, name?: string): Promise<Environment> {
    if (name) {
      return await this.withLoading('Fetching environment', async () => {
        return await this.request<Environment>(`/teams/${ slug }/environments/${ name }`)
      })
    }
    return await this.promptEnvironment(slug)
  }

}
