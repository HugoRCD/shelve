import { ofetch } from 'ofetch'

/*export const $api = ofetch.create({
  baseURL: `${loadUserConfig().url + 'api' || SHELVE_API_URL}`,
  onRequest({ options }) {
    options.headers = {
      ...options.headers,
      Cookie: `authToken=${loadUserConfig().authToken || ''}`
    }
  },
  async onResponseError(ctx) {
    if (ctx.response.status === 401) {
      writeUserConfig({ ...loadUserConfig(), authToken: null })
      consola.error('Authentication failed, please login again with `shelve login`')
      await suggestLogin()
      process.exit(1)
    }
  }
})*/
