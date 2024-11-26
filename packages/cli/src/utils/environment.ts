import type { Environment } from '@shelve/types'
import { isCancel, select, spinner } from '@clack/prompts'
import { useApi } from './api'
import { capitalize } from './string'
import { onCancel } from './index'

const s = spinner()

export const getTeamEnvironment = async (teamId?: number): Promise<Environment[]> => {
  const api = await useApi()

  s.start('Fetching environments')
  try {
    const environments = await api(`/environments${teamId ? `?teamId=${teamId}` : ''}`)
    s.stop('Fetching environments')
    return environments
  } catch (e) {
    onCancel('Failed to fetch environments')
  }
}

export async function promptEnvironment(teamId?: number): Promise<Environment> {
  const environments = await getTeamEnvironment(teamId)

  const environmentId = await select({
    message: 'Select the environment:',
    options: environments.map(env => ({
      value: env.id,
      label: capitalize(env.name)
    })),
  })

  if (isCancel(environmentId)) onCancel('Operation cancelled.')

  const environment = environments.find(env => env.id === environmentId)
  if (!environment) onCancel('Invalid environment')

  return environment
}
