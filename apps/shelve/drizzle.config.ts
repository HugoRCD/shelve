import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'postgresql',
  schema: './server/database/schema.ts',
  out: './server/database/migrations',
  tablesFilter: ['!pg_stat_statements', '!pg_stat_statements_info'],
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
