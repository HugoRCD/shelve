import { defineNuxtModule, createResolver } from 'nuxt/kit'

type HubSchemaExtendContext = {
  dialect: string
  paths: string[]
}

export default defineNuxtModule({
  meta: {
    name: '@shelve/hub-schema-fix',
  },
  setup(_options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    nuxt.hook('hub:db:schema:extend' as any, (ctx: HubSchemaExtendContext) => {
      const { dialect } = ctx
      if (dialect !== 'postgresql') return

      // NuxtHub's production schema generator may emit `export * from "<abs>.ts"`,
      // which Node cannot import. Replace Better Auth's generated `.nuxt/.../.ts`
      // with our committed schema file inside the project so it gets inlined.
      const generatedSuffix = `/better-auth/schema.${dialect}.ts`
      for (let i = ctx.paths.length - 1; i >= 0; i--) {
        if (ctx.paths[i]?.endsWith(generatedSuffix)) {
          ctx.paths.splice(i, 1)
        }
      }

      const localSchemaPath = resolve('../../server/db/schema/better-auth.postgresql.ts')
      if (!ctx.paths.includes(localSchemaPath)) {
        ctx.paths.unshift(localSchemaPath)
      }
    })
  },
})
