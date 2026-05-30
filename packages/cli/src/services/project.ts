import { type PackageJson, readPackageJSON } from 'pkg-types'
import type { Project } from '@types'
import { cliInfo } from '../utils/output'
import { askBoolean, capitalize, handleCancel, isNonInteractive, shouldSkipConfirm } from '../utils'
import { isDebug, debugLog } from '../constants'
import { CliError, isRecoverableHttpError, toCliError } from './api-error'
import { BaseService } from './base'

export class ProjectService extends BaseService {

  static getProjects(slug: string): Promise<Project[]> {
    return this.withLoading('Load projects', () =>
      this.request<Project[]>(`/teams/${slug}/projects`)
    )
  }

  static async getProjectByName(name: string, slug: string, autoCreate: boolean = true): Promise<Project> {
    const encodedName = encodeURIComponent(name)

    try {
      return await this.withLoading(`Fetch project ${name}`, () => {
        return this.request<Project>(`/teams/${slug}/projects/name/${encodedName}`)
      }, {
        recoverable: error => isRecoverableHttpError(error, [400]),
      })
    } catch (error: unknown) {
      if (isDebug()) debugLog(`Failed to fetch project '${name}'`, error)

      if (isRecoverableHttpError(error, [400])) {
        if (autoCreate) {
          if (!name || !slug) {
            return handleCancel(`Project '${name}' does not exist, and could not be auto-created without a name and slug`)
          }
          return this.createProject(name, slug, autoCreate)
        }

        if (isNonInteractive() && !shouldSkipConfirm()) {
          throw new CliError(
            `Project '${name}' does not exist.`,
            'PROJECT_NOT_FOUND',
            400,
            'Enable autoCreateProject in shelve.json or pass --yes after creating the project manually.',
          )
        }

        await askBoolean(`Project '${name}' does not exist. Would you like to create it?`)

        return this.createProject(name, slug, autoCreate)
      }

      throw toCliError(error)
    }
  }

  private static getRepositoryURL(pkg: PackageJson): string | undefined {
    if (typeof pkg.repository === 'string') return pkg.repository
    if (pkg.repository?.url) {
      return pkg.repository.url.replace(/^git\+/, '').replace(/\.git$/, '')
    }
  }

  static async createProject(name: string, slug: string, autoCreate?: boolean): Promise<Project> {
    if (autoCreate) cliInfo(`Auto-creating project '${name}'`)
    const pkg = await readPackageJSON()
    const input = {
      name: capitalize(name),
      description: pkg.description,
      homepage: pkg.homepage,
      repository: this.getRepositoryURL(pkg)
    }
    return this.withLoading(`Create project ${name}`, () => {
      return this.request<Project>(`/teams/${ slug }/projects`, {
        method: 'POST',
        body: input
      })
    })
  }

}
