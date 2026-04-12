// Force PGlite by clearing any PostgreSQL connection URLs
// This runs before Nuxt's loadNuxt/loadDotenv reads the .env file
delete process.env.DATABASE_URL
delete process.env.POSTGRES_URL
delete process.env.POSTGRESQL_URL
