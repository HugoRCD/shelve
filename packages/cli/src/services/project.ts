import type { Project } from '@shelve/types'
import { PackageJson, readPackageJSON } from 'pkg-types'
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

  static async getProjectByName(name: string, slug: string, autoCreate: boolean = true): Promise<Project> {
    const encodedName = encodeURIComponent(name)

    try {
      return await this.withLoading(`Fetching '${name}' project${DEBUG ? ' - Debug mode' : ''}`, () => {
        return this.request<Project>(`/teams/${slug}/projects/name/${encodedName}`)
      })
    } catch (error: any) {
      if (DEBUG) console.log(error)

      if (error.statusCode === 400) {
        if (autoCreate) {
          if (!name || !slug)
            return handleCancel(`Project '${name}' does not exist, and could not be auto-created without a name and slug`)
          return this.createProject(name, slug, autoCreate)
        }

        await askBoolean(`Project '${name}' does not exist. Would you like to create it?`)

        return this.createProject(name, slug, autoCreate)
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

  static async createProject(name: string, slug: string, autoCreate?: boolean): Promise<Project> {
    if (autoCreate) log.info(`Auto-creating project '${name}'`)
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
