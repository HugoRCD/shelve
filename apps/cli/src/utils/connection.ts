/*
import { ofetch } from 'ofetch'

export const $api = ofetch.create({
  baseURL: joinURL(NUXT_HUB_URL, '/api'),
  onRequest({ options }) {
    options.headers = options.headers || {}
    if (!options.headers.Authorization) {
      options.headers.Authorization = `Bearer ${loadUserConfig().hub?.userToken || ''}`
    }
  },
  onResponseError(ctx) {
    if (ctx.response._data?.message) {
      ctx.error = new Error(`- ${ctx.response._data.message}`)
    }
  }
})
*/
