import {
  defineNuxtModule,
  addServerImportsDir,
  createResolver
} from 'nuxt/kit'

export default defineNuxtModule({
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
