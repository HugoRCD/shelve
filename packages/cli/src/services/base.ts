import { ofetch, type $Fetch, type FetchOptions } from 'ofetch'
import { handleCancel, loadShelveConfig } from '../utils'
import { ErrorService } from './error'
import { isCancel, password, spinner } from '@clack/prompts'
import { EnvService } from './env'

export abstract class BaseService {
    protected static api: $Fetch

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

    static async getToken(): Promise<string> {
        const { url } = await loadShelveConfig()
        const sanitizedUrl = url.replace(/\/+$/, '')
        const token = await password({
            message: `Please provide a valid token (you can generate one on ${sanitizedUrl}/tokens)`,
            validate: (value) => value.length === 0 ? 'Value is required!' : undefined
        })

        if (isCancel(token))
            handleCancel('Operation cancelled.')

        await EnvService.mergeEnvFile([{ key: 'SHELVE_TOKEN', value: token }])
        return token
    }

    protected static async getApi(): Promise<$Fetch> {
        if (!this.api) {
            const config = await loadShelveConfig()

            if (!config.token)
                config.token = await this.getToken()

            const baseURL = `${config.url.replace(/\/+$/, '')}/api`

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