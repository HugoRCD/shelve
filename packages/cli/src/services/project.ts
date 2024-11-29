import type { Project } from '@shelve/types'
import { BaseService } from './base'
import { API_ENDPOINTS, DEBUG } from '../constants'
import { askBoolean, capitalize, handleCancel, loadShelveConfig, useLoading } from '../utils'

export class ProjectService extends BaseService {
  static async getProjects(): Promise<Project[]> {
    const { teamId } = await loadShelveConfig()

    return useLoading('Loading projects', () => {
      const query = teamId ? `?teamId=${teamId}` : ''
      return this.request<Project[]>(`${API_ENDPOINTS.projects}${query}`)
    })
  }

  static async getProjectByName(name: string): Promise<Project> {
    const { teamId } = await loadShelveConfig()

    try {
      return await useLoading(`Fetching '${name}' project${DEBUG ? ' - Debug mode' : ''}`, () => {
        const encodedName = encodeURIComponent(name)
        const query = teamId ? `?teamId=${teamId}` : ''
        return this.request<Project>(`${API_ENDPOINTS.projects}/name/${encodedName}${query}`)
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

  static async createProject(name: string): Promise<Project> {
    const { teamId } = await loadShelveConfig()

    return useLoading('Creating project', () => {
      return this.request<Project>(`${API_ENDPOINTS.projects}`, {
        method: 'POST',
        body: {
          name: capitalize(name),
          teamId
        }
      })
    })
  }
}