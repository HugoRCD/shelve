import { Project } from '@shelve/types'
import { ofetch } from 'ofetch'
import { useLoading, capitalize, loadShelveConfig, askBoolean, handleCancel } from '../utils'
import { ApiService } from './api'

export class ProjectService {

  private static getApi(): Promise<typeof ofetch> {
    return ApiService.initialize()
  }

  static async getProjects(): Promise<Project[]> {
    const { teamId } = await loadShelveConfig()
    const api = await this.getApi()

    return useLoading('Loading projects', () => {
      const query = teamId ? `?teamId=${teamId}` : ''
      return api(`/projects${query}`)
    })
  }

  static async getProjectByName(name: string): Promise<Project> {
    const { teamId } = await loadShelveConfig()
    const debug = process.env.DEBUG === 'true'
    const api = await this.getApi()

    try {
      return await useLoading(
        `Fetching '${name}' project${debug ? ' - Debug mode' : ''}`,
        () => {
          const encodedName = encodeURIComponent(name)
          const query = teamId ? `?teamId=${teamId}` : ''
          return api(`/projects/name/${encodedName}${query}`)
        }
      )
    } catch (error: any) {
      if (debug) console.log(error)

      if (error.response?.status === 400) {
        const shouldCreate = await askBoolean(`Project '${name}' does not exist. Would you like to create it?`)

        if (!shouldCreate) return handleCancel('Operation cancelled.')

        return this.createProject(name)
      }

      return handleCancel('Failed to fetch project')
    }
  }

  static async createProject(name: string): Promise<Project> {
    const { teamId } = await loadShelveConfig()
    const api = await this.getApi()

    return useLoading('Creating project', () => {
      return api('/projects', {
        method: 'POST',
        body: {
          name: capitalize(name),
          teamId
        }
      })
    })
  }

}
