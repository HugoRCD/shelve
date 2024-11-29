import { ofetch, type $Fetch } from 'ofetch'
import { handleCancel, loadShelveConfig } from '../utils'
import { ErrorService } from './error'
import { isCancel, password } from '@clack/prompts'
import { EnvService } from './env'

export abstract class BaseService {
    protected static api: $Fetch

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

    protected static async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
        const api = await this.getApi()
        return api(endpoint, options)
    }
}