import type { Project } from '@shelve/types'
import { PackageJson, readPackageJSON } from 'pkg-types'
import { DEBUG } from '../constants'
import { askBoolean, capitalize, handleCancel } from '../utils'
import { BaseService } from './base'

export class ProjectService extends BaseService {

  static getProjects(slug: string): Promise<Project[]> {
    return this.withLoading('Loading projects', () =>
      this.request<Project[]>(`/teams/${slug}/projects`)
    )
  }

  static async getProjectByName(name: string, slug: string, autoCreate: boolean = true): Promise<Project> {
    const encodedName = encodeURIComponent(name)

    try {
      return await this.withLoading(`Fetching '${name}' project${DEBUG ? ' - Debug mode' : ''}`, () => {
        return this.request<Project>(`/teams/${slug}/projects/name/${encodedName}`)
      })
    } catch (error: any) {
      if (DEBUG) console.log(error)

      if (error.statusCode === 400 && autoCreate) {
        await askBoolean(`Project '${name}' does not exist. Would you like to create it?`)

        return this.createProject(name, slug)
      }

      return handleCancel('Failed to fetch project')
    }
  }

  private static getRepositoryURL(pkg: PackageJson): string | undefined {
    if (typeof pkg.repository === 'string') return pkg.repository
    if (pkg.repository?.url) {
      return pkg.repository.url.replace(/^git\+/, '').replace(/\.git$/, '')
    }
  }

  static async createProject(name: string, slug: string): Promise<Project> {
    const pkg = await readPackageJSON()
    const input = {
      name: capitalize(name),
      description: pkg.description,
      homepage: pkg.homepage,
      repository: this.getRepositoryURL(pkg)
    }
    return this.withLoading(`Creating '${ name }' project`, () => {
      return this.request<Project>(`/teams/${ slug }/projects`, {
        method: 'POST',
        body: input
      })
    })
  }

}
