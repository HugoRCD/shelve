import {
  defineNuxtModule,
  addServerImportsDir,
  createResolver
} from '@nuxt/kit'

export type ModuleOptions = {}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@shelve/crypto',
    configKey: 'shelveCrypto'
  },
  defaults: {},
  setup(_options, _nuxt) {
    const resolver = createResolver(import.meta.url)
    addServerImportsDir(resolver.resolve('./runtime'))
  }
})
