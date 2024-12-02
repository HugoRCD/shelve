import { ofetch, type $Fetch, type FetchOptions } from 'ofetch'
import { note, spinner } from '@clack/prompts'
import { $ } from 'bun'
import { askBoolean, askPassword, handleCancel, loadShelveConfig } from '../utils'
import { ErrorService } from './error'
import { EnvService } from './env'

export abstract class BaseService {

  protected static api: $Fetch
  private static readonly SHELVE_SSH_KEY = 'shelve_ed25519'
  private static readonly SHELVE_SSH_KEY_PATH = `~/.ssh/${this.SHELVE_SSH_KEY}`

  protected static async withLoading<T>(
    message: string,
    callback: () => Promise<T>
  ): Promise<T> {
    const s = spinner()
    try {
      s.start(message)
      const result = await callback()
      s.stop(message)
      return result
    } catch (error) {
      s.stop(`Failed: ${message.toLowerCase()}.`)
      throw error
    }
  }

  static generateSshKey(): Promise<void> {
    return this.withLoading('Generating Shelve SSH key', async () => {
      await $`ssh-keygen -t ed25519 -N "" -q -f ${this.SHELVE_SSH_KEY_PATH}`.quiet()
      await new Promise((resolve) => setTimeout(resolve, 10))
    })
  }

  static async isSshKeyPresent(): Promise<boolean> {
    try {
      await $`cat ${this.SHELVE_SSH_KEY_PATH}.pub`.quiet()
      return true
    } catch {
      return false
    }
  }

  static getPublicKey(): Promise<string> {
    return $`cat ${this.SHELVE_SSH_KEY_PATH}.pub`.text()
  }

  static async checkSshKey(url: string): Promise<void> {
    const isSshKeyPresent = await this.isSshKeyPresent()
    if (!isSshKeyPresent) {
      const generateKey = await askBoolean('No SSH key found, do you want to generate one?')
      if (generateKey) {
        await this.generateSshKey()
        note(`Please add the following SSH key to your Shelve account (you can do it on ${url}/settings/ssh-keys): ${await this.getPublicKey()}`, 'SSH key generated')
        const confirmKey = await askBoolean('Have you added the SSH key to your Shelve account?')
        if (!confirmKey)
          handleCancel('Please add the SSH key to your Shelve account and try again.')
      }
    }
  }

  static async getToken(): Promise<string> {
    const { url } = await loadShelveConfig()
    const sanitizedUrl = url.replace(/\/+$/, '')
    const token = await askPassword(`Please provide a valid token (you can generate one on ${sanitizedUrl}/tokens)`)

    await EnvService.mergeEnvFile([{ key: 'SHELVE_TOKEN', value: token }])
    return token
  }

  protected static async getApi(): Promise<$Fetch> {
    if (!this.api) {
      const config = await loadShelveConfig()

      if (!config.token)
        config.token = await this.getToken()

      const baseURL = `${config.url.replace(/\/+$/, '')}/api`

      // await this.checkSshKey(config.url)

      this.api = ofetch.create({
        baseURL,
        headers: {
          Cookie: `authToken=${config.token}`
        },
        onResponseError: ErrorService.handleApiError
      })
    }
    return this.api
  }

  protected static async request<T>(endpoint: string, options?: FetchOptions<'json'>): Promise<T> {
    const api = await this.getApi()
    const { teamId } = await loadShelveConfig()

    if (teamId) endpoint += `?teamId=${teamId.toString()}`

    return api<T>(endpoint, options)
  }

}
