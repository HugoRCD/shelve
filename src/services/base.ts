export abstract class BaseService {
    protected static api: $Fetch

    protected static async withApi<T>(
        callback: (api: $Fetch) => Promise<T>
    ): Promise<T> {
        const api = await this.getApi()
        return callback(api)
    }

    protected static async getApi(): Promise<$Fetch> {
        if (!this.api) {
            const config = await loadShelveConfig()
            if (!config.token) {
                config.token = await this.getToken()
            }

            const baseURL = `${config.url.replace(/\/+$/, '')}/api`

            this.api = ofetch.create({
                baseURL,
                headers: {
                    'Content-Type': 'application/json',
                    Cookie: `authToken=${config.token}`
                },
                onResponseError: ErrorService.handleApiError
            })
        }
        return this.api
    }
} 