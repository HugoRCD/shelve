import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'postgresql',
  schema: './schema.ts',
  out: './server/database/migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
