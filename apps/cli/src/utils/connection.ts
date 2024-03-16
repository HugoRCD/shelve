import { loadUserConfig, writeUserConfig } from "./config.ts";
import { ofetch } from 'ofetch'
import consola from "consola";

const SHELVE_API_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:3000/api' : 'https://shelve.hrcd.fr/api'

export const $api = ofetch.create({
  baseURL: SHELVE_API_URL,
  onRequest({ options }) {
    options.headers = {
      ...options.headers,
      Cookie: `authToken=${loadUserConfig().authToken || ''}`
    }
  },
  onResponseError(ctx) {
    if (ctx.response.status === 401) {
      writeUserConfig({ ...loadUserConfig(), authToken: null })
      consola.error('Authentication failed, please login again using `shelve login`')
    }
  }
})
