import {
  defineNuxtModule,
  addServerImportsDir,
  createResolver
} from '@nuxt/kit'

export default defineNuxtModule({
  meta: {
    name: '@shelve/crypto',
  },
  setup() {
    const resolver = createResolver(import.meta.url)
    addServerImportsDir(resolver.resolve('./runtime'))
  }
})
