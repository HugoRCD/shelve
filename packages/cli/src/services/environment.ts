import type { Environment, Project } from '@shelve/types'
import { isCancel } from '@clack/prompts'
import { askSelect, capitalize, handleCancel } from '../utils'
import { BaseService } from './base'

export class EnvironmentService extends BaseService {

  static async promptEnvironment(project: Project): Promise<Environment> {
    const environments = await this.withLoading('Fetching environments', async () => {
      return await this.request<Environment[]>(`/teams/${project.teamId}/environments`)
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

