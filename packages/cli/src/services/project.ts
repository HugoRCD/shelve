import type { Project } from '@shelve/types'
import { log } from '@clack/prompts'
import { DEBUG } from '../constants'
import { askBoolean, capitalize, handleCancel } from '../utils'
import { BaseService } from './base'

export class ProjectService extends BaseService {

  static getProjects(slug: string): Promise<Project[]> {
    return this.withLoading('Loading projects', () =>
      this.request<Project[]>(`/teams/${slug}/projects`)
    )
  }

  static async getProjectByName(name: string, slug: string): Promise<Project> {
    const encodedName = encodeURIComponent(name)

    try {
      return await this.withLoading(`Fetching '${name}' project${DEBUG ? ' - Debug mode' : ''}`, () => {
        return this.request<Project>(`/teams/${slug}/projects/name/${encodedName}`)
      })
    } catch (error: any) {
      if (DEBUG) log.error(error)

      if (error.statusCode === 400) {
        await askBoolean(`Project '${name}' does not exist. Would you like to create it?`)

        return this.createProject(name, slug)
      }

      return handleCancel('Failed to fetch project')
    }
  }

  static createProject(name: string, slug: string): Promise<Project> {
    return this.withLoading(`Creating '${name}' project`, () => {
      return this.request<Project>(`/teams/${slug}/projects`, {
        method: 'POST',
        body: {
          name: capitalize(name),
        }
      })
    })
  }

}
