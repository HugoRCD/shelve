import type { EnvVar, CreateEnvFileInput, PushEnvFileInput, CreateVariablesInput } from '@shelve/types'
import { parseEnvFile } from '@shelve/utils'
import { loadShelveConfig, askBoolean } from '../utils'
import { API_ENDPOINTS } from '../constants'
import { FileService } from './file'
import { BaseService } from './base'

export class EnvService extends BaseService {

  static formatEnvContent(variables: EnvVar[]): string {
    const content = variables
      .map((item) => `${item.key}=${item.value}`)
      .join('\n')
    return `# Generated by Shelve CLI\n${content}`
  }

  static async getEnvFile(): Promise<EnvVar[]> {
    const { envFileName } = await loadShelveConfig()

    if (FileService.exists(envFileName)) {
      const envFile = FileService.read(envFileName)
      return parseEnvFile(envFile)
    }

    return []
  }

  static async mergeEnvFile(variables: EnvVar[]): Promise<void> {
    const { envFileName } = await loadShelveConfig()

    await this.withLoading(`Merging ${envFileName} file`, async () => {
      const envFile = await this.getEnvFile()
      envFile.push(...variables)

      const content = this.formatEnvContent(envFile)
      FileService.write(envFileName, content)
    })
  }

  static async createEnvFile(input: CreateEnvFileInput): Promise<void> {
    const { envFileName, variables, confirmChanges } = input

    if (confirmChanges)
      await askBoolean(`Are you sure you want to update ${envFileName} file?`)

    await this.withLoading(`Creating ${envFileName} file`, () => {
      const content = this.formatEnvContent(variables)

      if (FileService.exists(envFileName)) FileService.delete(envFileName)

      FileService.write(envFileName, content)
    })
  }

  static getEnvVariables(projectId: number, environmentId: number): Promise<EnvVar[]> {
    return this.withLoading('Fetching variables', () => {
      return this.request<EnvVar[]>(`${API_ENDPOINTS.variables}/project/${projectId}/${environmentId}`)
    })
  }

  static async pushEnvFile(input: PushEnvFileInput): Promise<void> {
    const { variables, projectId, environment, confirmChanges, autoUppercase } = input
    if (confirmChanges)
      await askBoolean(`Are you sure you want to push ${variables.length} variables to ${environment.name} environment?`)

    await this.withLoading('Pushing variables', async () => {
      const body: CreateVariablesInput = {
        projectId,
        autoUppercase,
        environmentIds: [environment.id],
        variables: variables.map((variable) => ({
          key: variable.key,
          value: variable.value
        }))
      }
      await this.request<EnvVar[]>(API_ENDPOINTS.variables, { method: 'POST', body })
    })
  }

  static async generateEnvExampleFile(): Promise<void> {
    const { envFileName } = await loadShelveConfig()
    const envExampleFile = `${envFileName}.example`

    await this.withLoading(`Generating ${envExampleFile} file`, async () => {
      const variables = await this.getEnvFile()
      const keys = variables.map((variable) => variable.key)

      FileService.write(envExampleFile, this.formatEnvContent(keys.map((key) => ({ key, value: 'your_value' }))))
    })
  }

}
