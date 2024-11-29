import { Project } from '@shelve/types'
import { ofetch } from 'ofetch'
import { useSpinner, capitalize, loadShelveConfig, askBoolean } from '../utils'
import { ErrorHandler } from '../utils/error-handler'
import { ApiService } from './api'

export class ProjectService {

  private static getApi(): Promise<typeof ofetch> {
    return ApiService.initialize()
  }

  static async getProjects(): Promise<Project[]> {
    const { teamId } = await loadShelveConfig(false)
    const api = await this.getApi()

    return useSpinner('Loading projects', () => {
      const query = teamId ? `?teamId=${teamId}` : ''
      return api(`/projects${query}`)
    })
  }

  static async getProjectByName(name: string): Promise<Project> {
    const { teamId } = await loadShelveConfig(false)
    const debug = process.env.DEBUG === 'true'
    const api = await this.getApi()

    try {
      return await useSpinner(
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

        if (!shouldCreate) return ErrorHandler.handleCancel('Operation cancelled.')

        return this.createProject(name)
      }

      return ErrorHandler.handleError(error)
    }
  }

  static async createProject(name: string): Promise<Project> {
    const { teamId } = await loadShelveConfig(false)
    const api = await this.getApi()

    return useSpinner('Creating project', () => {
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
