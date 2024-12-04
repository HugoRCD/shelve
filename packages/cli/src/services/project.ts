import type { Project } from '@shelve/types'
import { DEBUG } from '../constants'
import { askBoolean, capitalize, handleCancel } from '../utils'
import { BaseService } from './base'

export class ProjectService extends BaseService {

  static getProjects(): Promise<Project[]> {
    return this.withLoading('Loading projects', () =>
      this.request<Project[]>(`${API_ENDPOINTS.projects}`)
    )
  }

  static async getProjectByName(name: string): Promise<Project> {
    const encodedName = encodeURIComponent(name)

    try {
      return await this.withLoading(`Fetching '${name}' project${DEBUG ? ' - Debug mode' : ''}`, () => {
        return this.request<Project>(`${API_ENDPOINTS.projects}/name/${encodedName}`)
      })
    } catch (error: any) {
      if (DEBUG) console.log(error)

      if (error.response?.status === 400) {
        await askBoolean(`Project '${name}' does not exist. Would you like to create it?`)

        return this.createProject(name)
      }

      return handleCancel('Failed to fetch project')
    }
  }

  static createProject(name: string): Promise<Project> {
    return this.withLoading(`Creating '${name}' project`, () => {
      return this.request<Project>(`${API_ENDPOINTS.projects}`, {
        method: 'POST',
        body: {
          name: capitalize(name),
        }
      })
    })
  }

}
