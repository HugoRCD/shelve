import { consola } from 'consola'
import { migrate } from 'drizzle-orm/d1/migrator'

export default defineNitroPlugin(async (): Promise<void> => {
  if (!import.meta.dev) return

  await onHubReady(async () => {
    await migrate(useDrizzle(), {
      migrationsFolder: 'server/database/migrations',
    })
      .then(() => {
        consola.success('Database migrations done')
      })
      .catch((err) => {
        consola.error('Database migrations failed', err)
      })
  })
})
